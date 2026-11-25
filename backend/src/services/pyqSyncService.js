const prisma = require('../config/db');
const googleDriveService = require('./googleDriveService');
const {
  parseCourseFolder,
  parseSemesterFolder,
  parseSubjectFolder,
  parseSchemeFolder,
  parsePdfFileName,
  normalizeString
} = require('../utils/pyqParser');
const logger = require('../utils/logger');

// In-memory mutex to prevent concurrent overlapping executions
let isSyncInProgress = false;
let cancelRequested = false;

/**
 * Checks if a synchronization job is currently in progress
 */
async function isRunning() {
  if (isSyncInProgress) return true;

  // Check DB for any sync stuck in 'running' within the last 30 minutes
  const activeLog = await prisma.pyqSyncLog.findFirst({
    where: {
      status: 'running',
      startedAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000)
      }
    },
    orderBy: { startedAt: 'desc' }
  });

  return Boolean(activeLog);
}

/**
 * Gets the current status of the synchronization process and the latest log
 */
async function getSyncStatus() {
  const active = await isRunning();
  const latestLog = await prisma.pyqSyncLog.findFirst({
    orderBy: { startedAt: 'desc' },
    include: {
      triggeredBy: {
        select: { id: true, fullName: true, email: true, role: true }
      }
    }
  });

  const [totalAvailablePYQs, totalDrivePYQs, totalCourses, totalSubjects] = await Promise.all([
    prisma.questionPaper.count({ where: { isAvailable: true } }),
    prisma.questionPaper.count({ where: { driveFileId: { not: null } } }),
    prisma.course.count(),
    prisma.subject.count()
  ]);

  return {
    isConfigured: googleDriveService.isConfigured(),
    rootFolderId: googleDriveService.getRootFolderId(),
    isRunning: active,
    latestLog,
    stats: {
      availablePYQs: totalAvailablePYQs,
      driveSyncedPYQs: totalDrivePYQs,
      totalCourses,
      totalSubjects
    }
  };
}

/**
 * Helper: Normalizes a string for loose comparison (alphanumeric only)
 */
function toSearchToken(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Matches a subject folder to a database subject record in the given course and semester
 */
function matchSubject(parsedSubject, semesterSubjects) {
  if (!parsedSubject || !semesterSubjects || semesterSubjects.length === 0) return null;

  // 1. Direct code match if code was parsed
  if (parsedSubject.code) {
    const codeMatch = semesterSubjects.find(s => 
      s.code.toUpperCase() === parsedSubject.code ||
      toSearchToken(s.code) === toSearchToken(parsedSubject.code)
    );
    if (codeMatch) return codeMatch;
  }

  // 2. Exact normalized name match
  const targetToken = toSearchToken(parsedSubject.name);
  const exactMatch = semesterSubjects.find(s => toSearchToken(s.name) === targetToken);
  if (exactMatch) return exactMatch;

  // 3. Substring / contains match
  const partialMatch = semesterSubjects.find(s => {
    const sToken = toSearchToken(s.name);
    return sToken.includes(targetToken) || targetToken.includes(sToken);
  });
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * READ-ONLY DRY-RUN SCAN:
 * Recursively scans Google Drive folder hierarchy without modifying any database records.
 * Returns a complete audit report of all detected courses, semesters, subjects, schemes, and PDF files.
 */
async function runDryRunScan() {
  const rootFolderId = googleDriveService.getRootFolderId();
  if (!rootFolderId) {
    throw new Error('Google Drive root folder ID is not configured (GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID).');
  }

  if (!googleDriveService.isConfigured()) {
    throw new Error('Google Drive credentials are not configured.');
  }

  logger.info(`[PYQ DryRun] Starting read-only folder scan on root: ${rootFolderId}`);

  // Pre-load reference catalogs from database
  const [courses, schemes] = await Promise.all([
    prisma.course.findMany({
      include: {
        semesters: {
          include: {
            subjects: true
          }
        }
      }
    }),
    prisma.scheme.findMany()
  ]);

  const report = {
    scannedAt: new Date().toISOString(),
    rootFolderId,
    summary: {
      totalCourseFolders: 0,
      totalSemesterFolders: 0,
      totalSubjectFolders: 0,
      totalSchemeFolders: 0,
      totalPdfFiles: 0,
      matchedPdfs: 0,
      unmatchedPdfs: 0,
      warningsCount: 0
    },
    coursesTree: [],
    unmatchedFolders: [],
    warnings: []
  };

  // 1. Level 1: Course Folders in Root
  const courseFolders = await googleDriveService.listFolderContents(rootFolderId, { onlyFolders: true });
  report.summary.totalCourseFolders = courseFolders.length;

  for (const cFolder of courseFolders) {
    const parsedCourse = parseCourseFolder(cFolder.name);
    if (!parsedCourse) {
      report.unmatchedFolders.push({
        level: 'Course',
        folderId: cFolder.id,
        folderName: cFolder.name,
        reason: 'Unrecognized degree program name.'
      });
      continue;
    }

    const dbCourse = courses.find(c => c.code === parsedCourse.code);
    const courseNode = {
      folderId: cFolder.id,
      folderName: cFolder.name,
      parsedName: parsedCourse.name,
      courseCode: parsedCourse.code,
      isDbMatched: Boolean(dbCourse),
      semesters: []
    };

    if (!dbCourse) {
      report.warnings.push(`Course "${parsedCourse.name}" (${parsedCourse.code}) not found in database.`);
      report.summary.warningsCount++;
    }

    // 2. Level 2: Semester Folders in Course
    const semesterFolders = await googleDriveService.listFolderContents(cFolder.id, { onlyFolders: true });
    report.summary.totalSemesterFolders += semesterFolders.length;

    for (const semFolder of semesterFolders) {
      const parsedSemester = parseSemesterFolder(semFolder.name, parsedCourse.totalSemesters);
      if (!parsedSemester) {
        report.unmatchedFolders.push({
          level: 'Semester',
          parentCourse: parsedCourse.name,
          folderId: semFolder.id,
          folderName: semFolder.name,
          reason: `Unrecognized semester or exceeds course maximum (${parsedCourse.totalSemesters}).`
        });
        continue;
      }

      const dbSemester = dbCourse?.semesters.find(s => s.semesterNumber === parsedSemester.semesterNumber);
      const semesterNode = {
        folderId: semFolder.id,
        folderName: semFolder.name,
        semesterNumber: parsedSemester.semesterNumber,
        isDbMatched: Boolean(dbSemester),
        subjects: []
      };

      // 3. Level 3: Subject Folders in Semester
      const subjectFolders = await googleDriveService.listFolderContents(semFolder.id, { onlyFolders: true });
      report.summary.totalSubjectFolders += subjectFolders.length;

      for (const subFolder of subjectFolders) {
        const parsedSubject = parseSubjectFolder(subFolder.name);
        if (!parsedSubject) continue;

        const dbSubject = dbSemester ? matchSubject(parsedSubject, dbSemester.subjects) : null;
        const subjectNode = {
          folderId: subFolder.id,
          folderName: subFolder.name,
          parsedName: parsedSubject.name,
          parsedCode: parsedSubject.code,
          dbSubjectCode: dbSubject?.code || null,
          dbSubjectName: dbSubject?.name || null,
          isDbMatched: Boolean(dbSubject),
          schemes: []
        };

        if (!dbSubject) {
          report.warnings.push(
            `Subject folder "${subFolder.name}" in ${parsedCourse.name} Sem ${parsedSemester.semesterNumber} could not be mapped to an official database subject.`
          );
          report.summary.warningsCount++;
        }

        // 4. Level 4: Scheme Folders in Subject
        const schemeFolders = await googleDriveService.listFolderContents(subFolder.id, { onlyFolders: true });
        report.summary.totalSchemeFolders += schemeFolders.length;

        for (const schFolder of schemeFolders) {
          const parsedScheme = parseSchemeFolder(schFolder.name);
          if (!parsedScheme) {
            report.unmatchedFolders.push({
              level: 'Scheme',
              parentSubject: parsedSubject.name,
              folderId: schFolder.id,
              folderName: schFolder.name,
              reason: 'Not a recognized KSLU scheme (Scheme 80 Marks or Scheme 100 Marks).'
            });
            continue;
          }

          const dbScheme = schemes.find(s => s.code === parsedScheme.code);
          const schemeNode = {
            folderId: schFolder.id,
            folderName: schFolder.name,
            marks: parsedScheme.marks,
            schemeCode: parsedScheme.code,
            isDbMatched: Boolean(dbScheme),
            files: []
          };

          // 5. Level 5: PDF Files in Scheme Folder
          const pdfFiles = await googleDriveService.listFolderContents(schFolder.id, { onlyPdfs: true });
          for (const file of pdfFiles) {
            const isPdf = file.mimeType === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
            if (!isPdf) continue;

            report.summary.totalPdfFiles++;
            const parsedMeta = parsePdfFileName(file.name, dbSubject?.name || parsedSubject.name);
            const isFullyMapped = Boolean(dbCourse && dbSemester && dbSubject && dbScheme);

            if (isFullyMapped) {
              report.summary.matchedPdfs++;
            } else {
              report.summary.unmatchedPdfs++;
            }

            schemeNode.files.push({
              fileId: file.id,
              fileName: file.name,
              sizeBytes: file.size ? parseInt(file.size, 10) : 0,
              parsedTitle: parsedMeta.title,
              examYear: parsedMeta.examYear,
              examMonth: parsedMeta.examMonth,
              examType: parsedMeta.examType,
              isFullyMapped
            });
          }

          subjectNode.schemes.push(schemeNode);
        }

        semesterNode.subjects.push(subjectNode);
      }

      courseNode.semesters.push(semesterNode);
    }

    report.coursesTree.push(courseNode);
  }

  logger.info(`[PYQ DryRun] Scan complete. Found ${report.summary.totalPdfFiles} PDFs (${report.summary.matchedPdfs} matched).`);
  return report;
}

/**
 * PRODUCTION FULL SYNC:
 * Recursively scans Google Drive and synchronizes question papers into the database.
 * Uses driveFileId for unique upsert to prevent duplicates.
 * Never deletes records automatically when Drive files are temporarily missing; sets isAvailable = false instead.
 */
async function runFullSync(userId = null) {
  if (await isRunning()) {
    const error = new Error('A synchronization job is already running.');
    error.statusCode = 409;
    throw error;
  }

  const rootFolderId = googleDriveService.getRootFolderId();
  if (!rootFolderId) {
    const error = new Error('Google Drive root folder ID is not configured (GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID).');
    error.statusCode = 400;
    throw error;
  }

  if (!googleDriveService.isConfigured()) {
    const error = new Error('Google Drive credentials are not configured.');
    error.statusCode = 500;
    throw error;
  }

  isSyncInProgress = true;
  cancelRequested = false;

  const syncLog = await prisma.pyqSyncLog.create({
    data: {
      syncType: 'full',
      status: 'running',
      startedAt: new Date(),
      triggeredById: userId
    }
  });

  logger.info(`[PYQ Sync] Started full sync (Log ID: ${syncLog.id}) on root folder: ${rootFolderId}`);

  let filesFound = 0;
  let filesImported = 0;
  let filesUpdated = 0;
  let filesUnavailable = 0;
  let errorsCount = 0;
  const errorMessages = [];
  const scannedDriveFileIds = new Set();

  try {
    // Pre-load reference catalogs from database
    const [courses, schemes] = await Promise.all([
      prisma.course.findMany({
        include: {
          semesters: {
            include: {
              subjects: true
            }
          }
        }
      }),
      prisma.scheme.findMany()
    ]);

    // 1. Level 1: Course Folders in Root
    const courseFolders = await googleDriveService.listFolderContents(rootFolderId, { onlyFolders: true });

    for (const cFolder of courseFolders) {
      if (cancelRequested) break;

      const parsedCourse = parseCourseFolder(cFolder.name);
      if (!parsedCourse) {
        logger.debug(`[PYQ Sync] Skipping unrecognized folder at course level: ${cFolder.name}`);
        continue;
      }

      const dbCourse = courses.find(c => c.code === parsedCourse.code);
      if (!dbCourse) {
        errorMessages.push(`Course "${parsedCourse.name}" (${parsedCourse.code}) not found in database.`);
        errorsCount++;
        continue;
      }

      // 2. Level 2: Semester Folders in Course
      const semesterFolders = await googleDriveService.listFolderContents(cFolder.id, { onlyFolders: true });

      for (const semFolder of semesterFolders) {
        if (cancelRequested) break;

        const parsedSemester = parseSemesterFolder(semFolder.name, dbCourse.totalSemesters);
        if (!parsedSemester) {
          logger.debug(`[PYQ Sync] Skipping unrecognized semester: ${semFolder.name} in ${dbCourse.name}`);
          continue;
        }

        const dbSemester = dbCourse.semesters.find(s => s.semesterNumber === parsedSemester.semesterNumber);
        if (!dbSemester) {
          errorMessages.push(`Semester ${parsedSemester.semesterNumber} not found for course ${dbCourse.name}`);
          errorsCount++;
          continue;
        }

        // 3. Level 3: Subject Folders in Semester
        const subjectFolders = await googleDriveService.listFolderContents(semFolder.id, { onlyFolders: true });

        for (const subFolder of subjectFolders) {
          if (cancelRequested) break;

          const parsedSubject = parseSubjectFolder(subFolder.name);
          if (!parsedSubject) continue;

          const dbSubject = matchSubject(parsedSubject, dbSemester.subjects);
          if (!dbSubject) {
            errorMessages.push(`Unmatched subject folder: "${subFolder.name}" in ${dbCourse.code} Sem ${parsedSemester.semesterNumber}`);
            errorsCount++;
            continue;
          }

          // 4. Level 4: Scheme Folders in Subject
          const schemeFolders = await googleDriveService.listFolderContents(subFolder.id, { onlyFolders: true });

          for (const schFolder of schemeFolders) {
            if (cancelRequested) break;

            const parsedScheme = parseSchemeFolder(schFolder.name);
            if (!parsedScheme) continue;

            const dbScheme = schemes.find(s => s.code === parsedScheme.code);
            if (!dbScheme) {
              errorMessages.push(`Scheme ${parsedScheme.name} not found in database`);
              errorsCount++;
              continue;
            }

            // 5. Level 5: PDF Files in Scheme Folder
            const pdfFiles = await googleDriveService.listFolderContents(schFolder.id, { onlyPdfs: true });
            filesFound += pdfFiles.length;

            for (const file of pdfFiles) {
              if (cancelRequested) break;

              try {
                const isPdf = file.mimeType === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
                if (!isPdf) continue;

                scannedDriveFileIds.add(file.id);

                const { title, examYear, examMonth, examType } = parsePdfFileName(file.name, dbSubject.name);
                const fileSize = file.size ? parseInt(file.size, 10) : 0;

                // Upsert QuestionPaper by unique driveFileId to prevent duplicates
                const existing = await prisma.questionPaper.findUnique({
                  where: { driveFileId: file.id }
                });

                if (existing) {
                  await prisma.questionPaper.update({
                    where: { driveFileId: file.id },
                    data: {
                      title,
                      courseId: dbCourse.id,
                      semesterId: dbSemester.id,
                      subjectId: dbSubject.id,
                      schemeId: dbScheme.id,
                      examYear,
                      examMonth,
                      examType,
                      fileSize,
                      driveFolderId: schFolder.id,
                      driveWebViewLink: file.webViewLink || null,
                      md5Checksum: file.md5Checksum || null,
                      isAvailable: true,
                      lastSyncedAt: new Date()
                    }
                  });
                  filesUpdated++;
                } else {
                  await prisma.questionPaper.create({
                    data: {
                      title,
                      courseId: dbCourse.id,
                      semesterId: dbSemester.id,
                      subjectId: dbSubject.id,
                      schemeId: dbScheme.id,
                      examYear,
                      examMonth,
                      examType,
                      fileUrl: `/api/pyqs/drive/${file.id}`,
                      fileSize,
                      fileType: 'application/pdf',
                      driveFileId: file.id,
                      driveFolderId: schFolder.id,
                      driveWebViewLink: file.webViewLink || null,
                      md5Checksum: file.md5Checksum || null,
                      isAvailable: true,
                      isVerified: true,
                      uploadedById: userId,
                      lastSyncedAt: new Date()
                    }
                  });
                  filesImported++;
                }
              } catch (fileErr) {
                logger.error(`[PYQ Sync] Error processing file "${file.name}" (${file.id}): ${fileErr.message}`);
                errorsCount++;
                errorMessages.push(`File ${file.name}: ${fileErr.message}`);
              }
            }
          }
        }
      }
    }

    // Step 6: Mark missing drive files as unavailable (DO NOT DELETE, preserve data per requirement 11)
    if (!cancelRequested && scannedDriveFileIds.size > 0) {
      const previouslySynced = await prisma.questionPaper.findMany({
        where: {
          driveFileId: { not: null },
          isAvailable: true
        },
        select: { id: true, driveFileId: true }
      });

      const missing = previouslySynced.filter(p => !scannedDriveFileIds.has(p.driveFileId));
      if (missing.length > 0) {
        await prisma.questionPaper.updateMany({
          where: { id: { in: missing.map(m => m.id) } },
          data: { isAvailable: false }
        });
        filesUnavailable = missing.length;
        logger.info(`[PYQ Sync] Marked ${filesUnavailable} missing question papers as unavailable.`);
      }
    }

    // Fetch start page token for future incremental sync
    let changeToken = null;
    try {
      changeToken = await googleDriveService.getStartPageToken();
    } catch (tokenErr) {
      logger.warn('[PYQ Sync] Could not fetch startPageToken for incremental sync: ' + tokenErr.message);
    }

    // Finalize audit log
    const finalStatus = cancelRequested ? 'failed' : (errorsCount > 0 && filesImported === 0 ? 'failed' : 'completed');
    const updatedLog = await prisma.pyqSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: finalStatus,
        filesFound,
        filesImported,
        filesUpdated,
        filesUnavailable,
        errorsCount,
        errorDetails: errorMessages.slice(0, 50).join('\n') || (cancelRequested ? 'Cancelled by administrator' : null),
        changeToken,
        completedAt: new Date()
      }
    });

    logger.info(`[PYQ Sync] Finished sync (Log ID: ${syncLog.id}): found=${filesFound}, imported=${filesImported}, updated=${filesUpdated}, unavailable=${filesUnavailable}, errors=${errorsCount}`);
    return updatedLog;

  } catch (err) {
    logger.error('[PYQ Sync] Fatal sync failure: ' + err.message);
    await prisma.pyqSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        errorDetails: err.message,
        completedAt: new Date()
      }
    });
    throw err;
  } finally {
    isSyncInProgress = false;
    cancelRequested = false;
  }
}

/**
 * Aborts an active synchronization run
 */
function cancelSync() {
  if (isSyncInProgress) {
    cancelRequested = true;
    return true;
  }
  return false;
}

module.exports = {
  isRunning,
  getSyncStatus,
  runDryRunScan,
  runFullSync,
  cancelSync
};
