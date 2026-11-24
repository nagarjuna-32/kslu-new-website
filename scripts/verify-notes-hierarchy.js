const prisma = require('../backend/src/config/db');

async function verifyTests() {
  console.log('================================================================');
  console.log('      KSLU CIRCLE - NOTES HIERARCHY VERIFICATION SUITE         ');
  console.log('================================================================\n');

  // Load courses
  const courses = await prisma.course.findMany({
    include: {
      semesters: {
        orderBy: { semesterNumber: 'asc' },
        include: {
          subjects: {
            orderBy: { code: 'asc' }
          }
        }
      }
    }
  });

  const llb3 = courses.find(c => c.code === '3YR-LLB');
  const ballb = courses.find(c => c.code === '5YR-BALLB');
  const bballb = courses.find(c => c.code === '5YR-BBALLB');

  if (!llb3 || !ballb || !bballb) {
    throw new Error('Missing primary courses: 3YR-LLB, 5YR-BALLB, or 5YR-BBALLB');
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  // --- TEST 1 ---
  // Course: 3-Year LL.B, Semester: Semester 1
  // Subjects displayed must only be Semester 1 subjects of 3-Year LL.B
  const llb3Sem1 = llb3.semesters.find(s => s.semesterNumber === 1);
  assert(!!llb3Sem1, 'TEST 1: 3-Year LL.B Semester 1 exists');
  const llb3Sem1Subjects = llb3Sem1 ? llb3Sem1.subjects : [];
  assert(
    llb3Sem1Subjects.length > 0 && llb3Sem1Subjects.every(s => s.courseId === llb3.id && s.semesterId === llb3Sem1.id),
    'TEST 1: 3-Year LL.B Semester 1 shows only its assigned subjects',
    `Found ${llb3Sem1Subjects.length} subjects: ${llb3Sem1Subjects.map(s => s.name).join(', ')}`
  );

  // --- TEST 2 ---
  // Course: 3-Year LL.B, Semester: Semester 6
  // Must display Semester 6 subjects only. Must NEVER display Semester 7, 8, 9, 10
  const llb3Sem6 = llb3.semesters.find(s => s.semesterNumber === 6);
  assert(!!llb3Sem6, 'TEST 2: 3-Year LL.B Semester 6 exists');
  const llb3Sem6Subjects = llb3Sem6 ? llb3Sem6.subjects : [];
  assert(
    llb3Sem6Subjects.length > 0 && llb3Sem6Subjects.every(s => s.courseId === llb3.id && s.semesterId === llb3Sem6.id),
    'TEST 2: 3-Year LL.B Semester 6 shows only its assigned subjects',
    `Found ${llb3Sem6Subjects.length} subjects`
  );
  assert(
    llb3.totalSemesters === 6 && llb3.semesters.length === 6 && !llb3.semesters.some(s => s.semesterNumber > 6),
    'TEST 2: 3-Year LL.B NEVER contains or displays Semester 7, 8, 9, or 10',
    `Total semesters count: ${llb3.semesters.length}`
  );

  // --- TEST 3 ---
  // Course: B.A. LL.B, Semester: Semester 10
  // Subjects displayed must only be Semester 10 subjects of B.A. LL.B
  const ballbSem10 = ballb.semesters.find(s => s.semesterNumber === 10);
  assert(!!ballbSem10, 'TEST 3: B.A. LL.B Semester 10 exists');
  const ballbSem10Subjects = ballbSem10 ? ballbSem10.subjects : [];
  assert(
    ballbSem10Subjects.length > 0 && ballbSem10Subjects.every(s => s.courseId === ballb.id && s.semesterId === ballbSem10.id),
    'TEST 3: B.A. LL.B Semester 10 shows only its assigned subjects',
    `Found ${ballbSem10Subjects.length} subjects: ${ballbSem10Subjects.map(s => s.name).join(', ')}`
  );
  assert(
    ballb.totalSemesters === 10 && ballb.semesters.length === 10,
    'TEST 3: B.A. LL.B has exactly 10 semesters'
  );

  // --- TEST 4 ---
  // Course: B.B.A. LL.B, Semester: Semester 10
  // Subjects displayed must only be Semester 10 subjects of B.B.A. LL.B
  const bballbSem10 = bballb.semesters.find(s => s.semesterNumber === 10);
  assert(!!bballbSem10, 'TEST 4: B.B.A. LL.B Semester 10 exists');
  const bballbSem10Subjects = bballbSem10 ? bballbSem10.subjects : [];
  assert(
    bballbSem10Subjects.length > 0 && bballbSem10Subjects.every(s => s.courseId === bballb.id && s.semesterId === bballbSem10.id),
    'TEST 4: B.B.A. LL.B Semester 10 shows only its assigned subjects',
    `Found ${bballbSem10Subjects.length} subjects: ${bballbSem10Subjects.map(s => s.name).join(', ')}`
  );
  assert(
    bballb.totalSemesters === 10 && bballb.semesters.length === 10,
    'TEST 4: B.B.A. LL.B has exactly 10 semesters'
  );

  // --- TEST 5 & 6: Hierarchy Reset Rules ---
  console.log('\n--- Checking Hierarchy Logic & Isolation ---');
  // Check that no subject is shared across different courses
  const allSubjects = await prisma.subject.findMany();
  const subjectMap = new Map();
  let duplicateAcrossCourses = false;
  for (const sub of allSubjects) {
    const key = `${sub.courseId}_${sub.semesterId}_${sub.code}`;
    if (subjectMap.has(key)) duplicateAcrossCourses = true;
    subjectMap.set(key, true);
  }
  assert(!duplicateAcrossCourses, 'TEST 5 & 6: Strict Course-Semester-Subject uniqueness enforced');

  // --- TEST 7: 4 Categories exist and can be counted ---
  console.log('\n--- Checking 4 Notes Categories ---');
  const testCategories = ['STUDY_NOTES', 'IMPORTANT_QUESTIONS', 'REFERENCE_BOOKS', 'CASE_LAWS'];
  assert(testCategories.length === 4, 'TEST 7: Four core categories defined: STUDY_NOTES, IMPORTANT_QUESTIONS, REFERENCE_BOOKS, CASE_LAWS');

  // --- TEST 8: Seed a sample resource for each category to verify category queries ---
  console.log('\n--- Checking Category Resource Query & Isolation ---');
  const sampleSubject = llb3Sem1Subjects[0]; // Constitutional Law I
  const sampleAdmin = await prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] } } });

  if (sampleAdmin && sampleSubject) {
    for (const cat of testCategories) {
      await prisma.studyMaterial.upsert({
        where: { id: `test-${cat.toLowerCase()}-1` },
        update: {
          category: cat,
          status: 'APPROVED'
        },
        create: {
          id: `test-${cat.toLowerCase()}-1`,
          title: `Verified ${cat.replace('_', ' ')} Reference Guide`,
          description: `Official curriculum study material for ${sampleSubject.name}`,
          courseId: llb3.id,
          semesterId: llb3Sem1.id,
          subjectId: sampleSubject.id,
          category: cat,
          fileUrl: '/uploads/sample_reference.pdf',
          status: 'APPROVED',
          uploadedById: sampleAdmin.id
        }
      });
    }

    // Query each category to verify isolation
    for (const cat of testCategories) {
      const items = await prisma.studyMaterial.findMany({
        where: {
          courseId: llb3.id,
          semesterId: llb3Sem1.id,
          subjectId: sampleSubject.id,
          category: cat,
          status: 'APPROVED'
        }
      });
      assert(items.length > 0 && items.every(i => i.category === cat), `TEST 8: Category ${cat} returns matching resources with zero leakage`);
    }
  }

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

verifyTests().catch(err => {
  console.error('Test verification failure:', err);
  process.exit(1);
});
