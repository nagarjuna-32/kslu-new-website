const prisma = require('../backend/src/config/db');

// Exact course mapping from coursesData.js
const COURSE_MAPPING = {
  '3-year-llb': { code: '3YR-LLB', name: '3-Year LL.B', totalSemesters: 6 },
  'ba-llb': { code: '5YR-BALLB', name: '5-Year B.A. LL.B', totalSemesters: 10 },
  'bba-llb': { code: '5YR-BBALLB', name: '5-Year B.B.A. LL.B', totalSemesters: 10 },
  'bcom-llb': { code: '5YR-BCOMLLB', name: '5-Year B.Com. LL.B', totalSemesters: 10 },
  'bsc-llb': { code: '5YR-BSCLB', name: '5-Year B.Sc. LL.B', totalSemesters: 10 }
};

// Import SUBJECTS_MAP directly from coursesData.js
// Since coursesData.js uses ES modules (export const), we parse or replicate its exact definition
const SUBJECTS_MAP = {
  '3-year-llb': {
    1: [
      { code: 'KSLU-3Y-101', name: 'Constitutional Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-102', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-103', name: 'Law of Torts & Consumer Protection', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-104', name: 'Family Law - I (Hindu Law)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-105', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-106', name: 'English (Kannada Medium Option)', credits: 4, marks: 100 }
    ],
    2: [
      { code: 'KSLU-3Y-201', name: 'Constitutional Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-202', name: 'Contract - II (Special Contracts)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-203', name: 'Labour Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-204', name: 'Property Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-205', name: 'Family Law - II (Mohammedan Law & Indian Succession Act)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-206', name: 'Kannada / Kannada Kali', credits: 4, marks: 100 }
    ],
    3: [
      { code: 'KSLU-3Y-301', name: 'Jurisprudence', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-302', name: 'Labour Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-303', name: 'Law of Taxation', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-304', name: 'Criminal Law - II: BNSS, JJ Act & Probation of Offenders Act', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-305', name: 'Administrative Law', credits: 4, marks: 100 }
    ],
    4: [
      { code: 'KSLU-3Y-401', name: 'Public International Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-402', name: 'Optional - I: Human Rights Law and Practice / Insurance Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-403', name: 'Optional - II: Banking Law / Right to Information', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-404', name: 'Clinical - I: Professional Ethics & Professional Accounting', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-405', name: 'Clinical - II: Alternative Dispute Resolution (ADR) Systems', credits: 4, marks: 100 }
    ],
    5: [
      { code: 'KSLU-3Y-501', name: 'Company Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-502', name: 'Civil Procedure Code (CPC) and Limitation Act', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-503', name: 'Optional - III: Intellectual Property Rights - I / Penology & Victimology', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-504', name: 'Optional - IV: Interpretation of Statutes / Competition Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-505', name: 'Clinical - III: Drafting, Pleading and Conveyance', credits: 4, marks: 100 }
    ],
    6: [
      { code: 'KSLU-3Y-601', name: 'Law of Evidence: Bharatiya Sakshya Adhiniyam (BSA)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-602', name: 'Environmental Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-603', name: 'Optional - V: Intellectual Property Rights - II / White Collar Crimes', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-604', name: 'Optional - VI: Land Laws / International Trade Economics', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-605', name: 'Clinical - IV: Moot Court Exercise and Internship', credits: 4, marks: 100 }
    ]
  },
  'ba-llb': {
    1: [
      { code: 'KSLU-BA-101', name: 'English', credits: 4, marks: 100 },
      { code: 'KSLU-BA-102', name: 'Sociology - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-103', name: 'Political Science - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-104', name: 'Economics - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-105', name: 'Legal Methods', credits: 4, marks: 100 }
    ],
    2: [
      { code: 'KSLU-BA-201', name: 'Kannada', credits: 4, marks: 100 },
      { code: 'KSLU-BA-202', name: 'Indian Society', credits: 4, marks: 100 },
      { code: 'KSLU-BA-203', name: 'Law of Torts', credits: 4, marks: 100 },
      { code: 'KSLU-BA-204', name: 'Money & Banking', credits: 4, marks: 100 }
    ],
    3: [
      { code: 'KSLU-BA-301', name: 'Constitutional Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-302', name: 'Economic Theory', credits: 4, marks: 100 },
      { code: 'KSLU-BA-303', name: 'World Governments', credits: 4, marks: 100 },
      { code: 'KSLU-BA-304', name: 'Sociological Perspectives', credits: 4, marks: 100 }
    ],
    4: [
      { code: 'KSLU-BA-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-BA-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
      { code: 'KSLU-BA-403', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
      { code: 'KSLU-BA-404', name: 'Humanities Stream Paper (Stream Specific)', credits: 4, marks: 100 }
    ],
    5: [
      { code: 'KSLU-INT-501', name: 'Labour Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-INT-502', name: 'Jurisprudence', credits: 4, marks: 100 },
      { code: 'KSLU-INT-503', name: 'Family Law - I (Hindu Law)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-504', name: 'Contract - II (Special Contracts)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-505', name: 'Administrative Law', credits: 4, marks: 100 }
    ],
    6: [
      { code: 'KSLU-INT-601', name: 'Labour Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-INT-602', name: 'Company Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-603', name: 'Property Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-604', name: 'Family Law - II (Mohammedan Law & Succession)', credits: 4, marks: 100 }
    ],
    7: [
      { code: 'KSLU-INT-701', name: 'Public International Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-702', name: 'Law of Taxation', credits: 4, marks: 100 },
      { code: 'KSLU-INT-703', name: 'Criminal Law - II: Bharatiya Nagarik Suraksha Sanhita (BNSS)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-704', name: 'Clinical Course - I: Professional Ethics & Professional Accounting', credits: 4, marks: 100 }
    ],
    8: [
      { code: 'KSLU-INT-801', name: 'Law of Evidence: Bharatiya Sakshya Adhiniyam (BSA)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-802', name: 'Optional - I: Human Rights Law / Insurance Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-803', name: 'Optional - II: Banking Law / Right to Information', credits: 4, marks: 100 },
      { code: 'KSLU-INT-804', name: 'Clinical Course - II: Alternative Dispute Resolution (ADR) Systems', credits: 4, marks: 100 }
    ],
    9: [
      { code: 'KSLU-INT-901', name: 'Civil Procedure Code (CPC) and Limitation Act', credits: 4, marks: 100 },
      { code: 'KSLU-INT-902', name: 'Optional - III: Intellectual Property Rights - I / Penology & Victimology', credits: 4, marks: 100 },
      { code: 'KSLU-INT-903', name: 'Optional - IV: Interpretation of Statutes / Competition Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-904', name: 'Clinical Course - III: Drafting, Pleading and Conveyance', credits: 4, marks: 100 }
    ],
    10: [
      { code: 'KSLU-INT-1001', name: 'Environmental Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-1002', name: 'Optional - V: Intellectual Property Rights - II / White Collar Crimes', credits: 4, marks: 100 },
      { code: 'KSLU-INT-1003', name: 'Optional - VI: Land Laws / International Trade Economics', credits: 4, marks: 100 },
      { code: 'KSLU-INT-1004', name: 'Clinical Course - IV: Moot Court Exercise and Internship', credits: 4, marks: 100 }
    ]
  }
};

const copyCoreLawSemesters = (target) => {
  for (let sem = 5; sem <= 10; sem++) {
    target[sem] = SUBJECTS_MAP['ba-llb'][sem];
  }
};

SUBJECTS_MAP['bba-llb'] = {
  1: [
    { code: 'KSLU-BBA-101', name: 'English', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-102', name: 'Principles of Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-103', name: 'Micro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-104', name: 'Financial Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-105', name: 'Legal Methods', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-BBA-201', name: 'Kannada', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-202', name: 'Business Communication', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-203', name: 'Macro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-204', name: 'Cost Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-205', name: 'Law of Torts', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-BBA-301', name: 'Human Resource Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-302', name: 'Financial Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-303', name: 'Business Statistics', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-304', name: 'Corporate Environment', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-305', name: 'Constitutional Law - I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-BBA-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-403', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-404', name: 'Business Management Stream Paper (Stream Specific)', credits: 4, marks: 100 }
  ]
};
copyCoreLawSemesters(SUBJECTS_MAP['bba-llb']);

SUBJECTS_MAP['bcom-llb'] = {
  1: [
    { code: 'KSLU-COM-101', name: 'English', credits: 4, marks: 100 },
    { code: 'KSLU-COM-102', name: 'Business Environment', credits: 4, marks: 100 },
    { code: 'KSLU-COM-103', name: 'Micro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-COM-104', name: 'Financial Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM-105', name: 'Legal Methods', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-COM-201', name: 'Kannada', credits: 4, marks: 100 },
    { code: 'KSLU-COM-202', name: 'Principles of Management', credits: 4, marks: 100 },
    { code: 'KSLU-COM-203', name: 'Macro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-COM-204', name: 'Corporate Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM-205', name: 'Law of Torts', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-COM-301', name: 'Marketing & Services Management', credits: 4, marks: 100 },
    { code: 'KSLU-COM-302', name: 'Cost Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM-303', name: 'Principles of Auditing', credits: 4, marks: 100 },
    { code: 'KSLU-COM-304', name: 'Business Statistics', credits: 4, marks: 100 },
    { code: 'KSLU-COM-305', name: 'Constitutional Law - I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-COM-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
    { code: 'KSLU-COM-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
    { code: 'KSLU-COM-403', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
    { code: 'KSLU-COM-404', name: 'Financial Management / International Business', credits: 4, marks: 100 }
  ]
};
copyCoreLawSemesters(SUBJECTS_MAP['bcom-llb']);

SUBJECTS_MAP['bsc-llb'] = {
  1: [
    { code: 'KSLU-SC-101', name: 'English', credits: 4, marks: 100 },
    { code: 'KSLU-SC-102', name: 'Physics - I / Chemistry - I', credits: 4, marks: 100 },
    { code: 'KSLU-SC-103', name: 'Mathematics - I / Biology - I', credits: 4, marks: 100 },
    { code: 'KSLU-SC-104', name: 'Intro to Computers', credits: 4, marks: 100 },
    { code: 'KSLU-SC-105', name: 'Legal Methods', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-SC-201', name: 'Kannada', credits: 4, marks: 100 },
    { code: 'KSLU-SC-202', name: 'Physics - II / Chemistry - II', credits: 4, marks: 100 },
    { code: 'KSLU-SC-203', name: 'Mathematics - II / Biology - II', credits: 4, marks: 100 },
    { code: 'KSLU-SC-204', name: 'Scientific Method & Logic', credits: 4, marks: 100 },
    { code: 'KSLU-SC-205', name: 'Law of Torts', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-SC-301', name: 'Environmental Science', credits: 4, marks: 100 },
    { code: 'KSLU-SC-302', name: 'Statistics for Scientists', credits: 4, marks: 100 },
    { code: 'KSLU-SC-303', name: 'Law of Contract - I', credits: 4, marks: 100 },
    { code: 'KSLU-SC-304', name: 'Constitutional Law - I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-SC-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
    { code: 'KSLU-SC-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
    { code: 'KSLU-SC-403', name: 'Contract - II (Special Contracts)', credits: 4, marks: 100 },
    { code: 'KSLU-SC-404', name: 'Technology & Legal Frameworks', credits: 4, marks: 100 }
  ]
};
copyCoreLawSemesters(SUBJECTS_MAP['bsc-llb']);

async function syncExactMapping() {
  console.log('--- SYNCING EXACT COURSEDATA SUBJECT MAPPING ---');

  let totalUpserted = 0;

  for (const [courseKey, courseMeta] of Object.entries(COURSE_MAPPING)) {
    console.log(`\nProcessing ${courseMeta.name} (${courseMeta.code})...`);

    // Ensure Course exists
    const course = await prisma.course.upsert({
      where: { code: courseMeta.code },
      update: {
        name: courseMeta.name,
        totalSemesters: courseMeta.totalSemesters
      },
      create: {
        code: courseMeta.code,
        name: courseMeta.name,
        durationYears: courseMeta.totalSemesters === 6 ? 3 : 5,
        totalSemesters: courseMeta.totalSemesters,
        description: courseMeta.totalSemesters === 6 
          ? 'Post-graduate program in law for graduates of any discipline.'
          : `5-Year Integrated degree program combining professional curriculum with law.`
      }
    });

    // Ensure Semesters exist
    const semesterMap = {};
    for (let sem = 1; sem <= courseMeta.totalSemesters; sem++) {
      const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][sem - 1];
      const semester = await prisma.semester.upsert({
        where: {
          courseId_semesterNumber: {
            courseId: course.id,
            semesterNumber: sem
          }
        },
        update: {
          title: `Semester ${roman}`
        },
        create: {
          courseId: course.id,
          semesterNumber: sem,
          title: `Semester ${roman}`,
          description: `${course.name} - Semester ${roman}`
        }
      });
      semesterMap[sem] = semester;
    }

    // Now upsert subjects for this course from SUBJECTS_MAP
    const semSubjects = SUBJECTS_MAP[courseKey] || {};
    for (const [semNumStr, subjects] of Object.entries(semSubjects)) {
      const semNum = parseInt(semNumStr, 10);
      const semester = semesterMap[semNum];
      if (!semester) continue;

      for (const subj of subjects) {
        await prisma.subject.upsert({
          where: {
            courseId_semesterId_code: {
              courseId: course.id,
              semesterId: semester.id,
              code: subj.code
            }
          },
          update: {
            name: subj.name,
            credits: subj.credits || 4,
            isCore: true
          },
          create: {
            courseId: course.id,
            semesterId: semester.id,
            code: subj.code,
            name: subj.name,
            credits: subj.credits || 4,
            isCore: true,
            description: `${course.name} - ${subj.name} (${subj.code})`
          }
        });
        totalUpserted++;
      }
    }
  }

  console.log(`\n✓ Upserted ${totalUpserted} exact subjects according to coursesData.js!`);

  // Migrate any test notes to the new exact subject IDs if needed
  const llb3 = await prisma.course.findUnique({ where: { code: '3YR-LLB' } });
  const llb3Sem1 = await prisma.semester.findFirst({ where: { courseId: llb3.id, semesterNumber: 1 } });
  const constLawSub = await prisma.subject.findFirst({
    where: { courseId: llb3.id, semesterId: llb3Sem1.id, code: 'KSLU-3Y-101' }
  });

  if (constLawSub) {
    await prisma.studyMaterial.updateMany({
      where: { courseId: llb3.id, semesterId: llb3Sem1.id },
      data: { subjectId: constLawSub.id }
    });
    console.log(`✓ Re-linked study notes to official subject: ${constLawSub.code} (${constLawSub.name})`);
  }

  // Clean up any old placeholder subjects that don't match the official KSLU prefixes
  const validPrefixes = ['KSLU-3Y', 'KSLU-BA', 'KSLU-BBA', 'KSLU-COM', 'KSLU-SC', 'KSLU-INT'];
  const allSubs = await prisma.subject.findMany({
    select: { id: true, code: true }
  });

  const staleSubs = allSubs.filter(s => !validPrefixes.some(prefix => s.code.startsWith(prefix)));
  console.log(`Found ${staleSubs.length} legacy subject records to safely prune...`);

  for (const s of staleSubs) {
    // Check if any study materials or question papers are linked to this subject
    const noteCount = await prisma.studyMaterial.count({ where: { subjectId: s.id } });
    const pyqCount = await prisma.questionPaper.count({ where: { subjectId: s.id } });
    if (noteCount === 0 && pyqCount === 0) {
      await prisma.subject.delete({ where: { id: s.id } });
    }
  }

  console.log('✓ Database pruning completed safely without data loss.');

  const finalSubCount = await prisma.subject.count();
  console.log(`\nFinal Subject count in DB: ${finalSubCount}`);

  await prisma.$disconnect();
}

syncExactMapping().catch(err => {
  console.error('Sync failure:', err);
  process.exit(1);
});
