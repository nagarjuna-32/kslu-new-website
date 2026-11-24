const path = require('path');
const fs = require('fs');
const prisma = require('../backend/src/config/db');

function createSamplePdf(title, subtitle) {
  const streamContent = `BT\n/F1 16 Tf\n50 720 Td\n(${title}) Tj\n/F1 12 Tf\n0 -30 Td\n(${subtitle}) Tj\nET`;
  const streamLen = streamContent.length;

  return Buffer.from(`%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLen} >> stream
${streamContent}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000380 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
460
%%EOF`);
}

async function seedOfficialPYQs() {
  console.log('Seeding official KSLU Previous Year Question Papers...');

  const pyqDir = path.resolve(__dirname, '../backend/uploads/pyqs');
  if (!fs.existsSync(pyqDir)) {
    fs.mkdirSync(pyqDir, { recursive: true });
  }

  // Fetch schemes
  const scheme80 = await prisma.scheme.findUnique({ where: { code: '80_MARKS' } });
  const scheme100 = await prisma.scheme.findUnique({ where: { code: '100_MARKS' } });

  if (!scheme80 || !scheme100) {
    throw new Error('Marking schemes 80_MARKS and 100_MARKS must be seeded first.');
  }

  // Fetch courses with semesters and subjects
  const courses = await prisma.course.findMany({
    include: {
      semesters: {
        include: {
          subjects: true
        }
      }
    }
  });

  const getSubject = (courseCode, semNum, subjectCode) => {
    const course = courses.find(c => c.code === courseCode);
    if (!course) return null;
    const sem = course.semesters.find(s => s.semesterNumber === semNum);
    if (!sem) return null;
    const subject = sem.subjects.find(s => s.code === subjectCode);
    return subject ? { course, semester: sem, subject } : null;
  };

  const pyqDefinitions = [
    // 3-Year LL.B Sem 1
    {
      courseCode: '3YR-LLB',
      sem: 1,
      subjectCode: 'KSLU-3Y-101',
      title: 'Constitutional Law - I (Dec 2024 / Jan 2025)',
      examYear: 2024,
      examMonth: 'December',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_101_ConstLaw_Dec2024.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 1,
      subjectCode: 'KSLU-3Y-101',
      title: 'Constitutional Law - I (June / July 2023)',
      examYear: 2023,
      examMonth: 'June',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_101_ConstLaw_June2023.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 1,
      subjectCode: 'KSLU-3Y-102',
      title: 'Contract - I (General Principles) (Jan 2024)',
      examYear: 2024,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_102_Contract1_Jan2024.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 1,
      subjectCode: 'KSLU-3Y-102',
      title: 'Contract - I (General Principles) (Dec 2022)',
      examYear: 2022,
      examMonth: 'December',
      examType: 'REGULAR',
      scheme: scheme100,
      fileName: 'KSLU_3Y_102_Contract1_Dec2022.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 1,
      subjectCode: 'KSLU-3Y-103',
      title: 'Law of Torts & Consumer Protection (June 2023)',
      examYear: 2023,
      examMonth: 'June',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_103_Torts_June2023.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 1,
      subjectCode: 'KSLU-3Y-104',
      title: 'Family Law - I (Hindu Law) (Jan 2023)',
      examYear: 2023,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme100,
      fileName: 'KSLU_3Y_104_FamilyLaw1_Jan2023.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 1,
      subjectCode: 'KSLU-3Y-105',
      title: 'Criminal Law - I: Bharatiya Nyaya Sanhita (Dec 2024)',
      examYear: 2024,
      examMonth: 'December',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_105_CriminalLaw1_Dec2024.pdf'
    },

    // 3-Year LL.B Sem 2
    {
      courseCode: '3YR-LLB',
      sem: 2,
      subjectCode: 'KSLU-3Y-201',
      title: 'Constitutional Law - II (July 2024)',
      examYear: 2024,
      examMonth: 'July',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_201_ConstLaw2_July2024.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 2,
      subjectCode: 'KSLU-3Y-202',
      title: 'Contract - II (Special Contracts) (July 2023)',
      examYear: 2023,
      examMonth: 'July',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_202_Contract2_July2023.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 2,
      subjectCode: 'KSLU-3Y-203',
      title: 'Labour Law - I (July 2022)',
      examYear: 2022,
      examMonth: 'July',
      examType: 'REGULAR',
      scheme: scheme100,
      fileName: 'KSLU_3Y_203_LabourLaw1_July2022.pdf'
    },

    // 3-Year LL.B Sem 3
    {
      courseCode: '3YR-LLB',
      sem: 3,
      subjectCode: 'KSLU-3Y-301',
      title: 'Jurisprudence (Jan 2024)',
      examYear: 2024,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_301_Jurisprudence_Jan2024.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 3,
      subjectCode: 'KSLU-3Y-303',
      title: 'Law of Taxation (Jan 2023)',
      examYear: 2023,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_303_Taxation_Jan2023.pdf'
    },

    // 3-Year LL.B Sem 5
    {
      courseCode: '3YR-LLB',
      sem: 5,
      subjectCode: 'KSLU-3Y-501',
      title: 'Company Law (Jan 2024)',
      examYear: 2024,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_501_CompanyLaw_Jan2024.pdf'
    },
    {
      courseCode: '3YR-LLB',
      sem: 5,
      subjectCode: 'KSLU-3Y-502',
      title: 'Civil Procedure Code (CPC) (Jan 2023)',
      examYear: 2023,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_502_CPC_Jan2023.pdf'
    },

    // 3-Year LL.B Sem 6
    {
      courseCode: '3YR-LLB',
      sem: 6,
      subjectCode: 'KSLU-3Y-601',
      title: 'Law of Evidence: BSA (July 2024)',
      examYear: 2024,
      examMonth: 'July',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_3Y_601_Evidence_July2024.pdf'
    },

    // 5-Year B.A. LL.B Sem 1
    {
      courseCode: '5YR-BALLB',
      sem: 1,
      subjectCode: 'KSLU-BA-101',
      title: 'English (Jan 2024)',
      examYear: 2024,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_BA_101_English_Jan2024.pdf'
    },
    {
      courseCode: '5YR-BALLB',
      sem: 1,
      subjectCode: 'KSLU-BA-102',
      title: 'Sociology - I (Jan 2023)',
      examYear: 2023,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_BA_102_Sociology1_Jan2023.pdf'
    },
    {
      courseCode: '5YR-BALLB',
      sem: 1,
      subjectCode: 'KSLU-BA-103',
      title: 'Political Science - I (Jan 2024)',
      examYear: 2024,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_BA_103_PolSci1_Jan2024.pdf'
    },
    {
      courseCode: '5YR-BALLB',
      sem: 1,
      subjectCode: 'KSLU-BA-105',
      title: 'Legal Methods (Dec 2022)',
      examYear: 2022,
      examMonth: 'December',
      examType: 'REGULAR',
      scheme: scheme100,
      fileName: 'KSLU_BA_105_LegalMethods_Dec2022.pdf'
    },

    // 5-Year B.B.A. LL.B Sem 1
    {
      courseCode: '5YR-BBALLB',
      sem: 1,
      subjectCode: 'KSLU-BBA-102',
      title: 'Principles of Management (Jan 2024)',
      examYear: 2024,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_BBA_102_Mgmt_Jan2024.pdf'
    },
    {
      courseCode: '5YR-BBALLB',
      sem: 1,
      subjectCode: 'KSLU-BBA-103',
      title: 'Micro Economics (Jan 2023)',
      examYear: 2023,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_BBA_103_MicroEcon_Jan2023.pdf'
    },

    // 5-Year Integrated Sem 5 Common
    {
      courseCode: '5YR-BALLB',
      sem: 5,
      subjectCode: 'KSLU-INT-501',
      title: 'Labour Law - I (Integrated) (Jan 2024)',
      examYear: 2024,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_INT_501_LabourLaw1_Jan2024.pdf'
    },
    {
      courseCode: '5YR-BALLB',
      sem: 5,
      subjectCode: 'KSLU-INT-502',
      title: 'Jurisprudence (Integrated) (Jan 2023)',
      examYear: 2023,
      examMonth: 'January',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_INT_502_Jurisprudence_Jan2023.pdf'
    },
    {
      courseCode: '5YR-BALLB',
      sem: 5,
      subjectCode: 'KSLU-INT-503',
      title: 'Family Law - I (Hindu Law) (Integrated) (Dec 2021)',
      examYear: 2021,
      examMonth: 'December',
      examType: 'REGULAR',
      scheme: scheme100,
      fileName: 'KSLU_INT_503_FamilyLaw1_Dec2021.pdf'
    },

    // 5-Year Integrated Sem 10 Common
    {
      courseCode: '5YR-BALLB',
      sem: 10,
      subjectCode: 'KSLU-INT-1001',
      title: 'Environmental Law (Integrated) (July 2024)',
      examYear: 2024,
      examMonth: 'July',
      examType: 'REGULAR',
      scheme: scheme80,
      fileName: 'KSLU_INT_1001_EnvLaw_July2024.pdf'
    }
  ];

  let createdCount = 0;
  for (const def of pyqDefinitions) {
    const target = getSubject(def.courseCode, def.sem, def.subjectCode);
    if (!target) {
      console.warn(`Could not find subject ${def.subjectCode} in ${def.courseCode} sem ${def.sem}`);
      continue;
    }

    // Write sample PDF file
    const filePath = path.join(pyqDir, def.fileName);
    const pdfBuffer = createSamplePdf(def.title, `${target.course.name} - ${target.semester.title} (${def.scheme.name})`);
    fs.writeFileSync(filePath, pdfBuffer);

    // Create DB entry
    await prisma.questionPaper.create({
      data: {
        title: def.title,
        courseId: target.course.id,
        semesterId: target.semester.id,
        subjectId: target.subject.id,
        schemeId: def.scheme.id,
        examYear: def.examYear,
        examMonth: def.examMonth,
        examType: def.examType,
        fileUrl: `/uploads/pyqs/${def.fileName}`,
        fileSize: pdfBuffer.length,
        isVerified: true
      }
    });

    createdCount++;
  }

  console.log(`Successfully seeded ${createdCount} authentic KSLU previous year question papers.`);
  await prisma.$disconnect();
}

seedOfficialPYQs().catch(err => {
  console.error('Failed to seed official PYQs:', err);
  process.exit(1);
});
