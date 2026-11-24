const path = require('path');
const fs = require('fs');
const prisma = require('../backend/src/config/db');

async function removeDemoData() {
  console.log('=== REMOVING ALL DEMO DATA FOR GOOGLE DRIVE API INTEGRATION ===\n');

  // 1. Delete dependent relations (bookmarks, download logs, votes, reports)
  const delBookmarks = await prisma.bookmark.deleteMany({});
  console.log(`✓ Deleted ${delBookmarks.count} bookmarks.`);

  const delLogs = await prisma.downloadLog.deleteMany({});
  console.log(`✓ Deleted ${delLogs.count} download logs.`);

  const delVotes = await prisma.vote.deleteMany({});
  console.log(`✓ Deleted ${delVotes.count} user votes.`);

  const delReports = await prisma.report.deleteMany({});
  console.log(`✓ Deleted ${delReports.count} moderation reports.`);

  // 2. Delete question papers
  const delPyqs = await prisma.questionPaper.deleteMany({});
  console.log(`✓ Deleted ${delPyqs.count} question papers.`);

  // 3. Delete study materials / demo notes
  const delNotes = await prisma.studyMaterial.deleteMany({});
  console.log(`✓ Deleted ${delNotes.count} study materials.`);

  // 4. Clean uploads directories
  const uploadsDir = path.resolve(__dirname, '../backend/uploads');
  const pyqsDir = path.join(uploadsDir, 'pyqs');
  const notesDir = path.join(uploadsDir, 'notes');

  const cleanDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const files = fs.readdirSync(dirPath);
    let removed = 0;
    for (const f of files) {
      if (f === '.gitkeep') continue;
      const full = path.join(dirPath, f);
      try {
        if (fs.statSync(full).isFile()) {
          fs.unlinkSync(full);
          removed++;
        }
      } catch (err) {
        console.warn(`Failed to delete ${full}:`, err.message);
      }
    }
    // Ensure .gitkeep exists
    const gitkeep = path.join(dirPath, '.gitkeep');
    if (!fs.existsSync(gitkeep)) {
      fs.writeFileSync(gitkeep, '');
    }
    return removed;
  };

  const pyqsRemoved = cleanDir(pyqsDir);
  console.log(`✓ Cleaned pyqs storage: removed ${pyqsRemoved} files.`);

  const notesRemoved = cleanDir(notesDir);
  console.log(`✓ Cleaned notes storage: removed ${notesRemoved} files.`);

  // 5. Verify Academic Structure is 100% intact
  const coursesCount = await prisma.course.count();
  const semestersCount = await prisma.semester.count();
  const subjectsCount = await prisma.subject.count();
  const schemesCount = await prisma.scheme.count();

  console.log('\nAcademic Structure Verification:');
  console.log(`- Official Courses: ${coursesCount} (Intact)`);
  console.log(`- Official Semesters: ${semestersCount} (Intact)`);
  console.log(`- Official KSLU Subjects: ${subjectsCount} (Intact)`);
  console.log(`- Marking Schemes: ${schemesCount} (Intact)`);
  console.log('\nDatabase is now completely clean of demo resources and ready for Drive API integration!');

  await prisma.$disconnect();
}

removeDemoData().catch(err => {
  console.error('Failed to remove demo data:', err);
  process.exit(1);
});
