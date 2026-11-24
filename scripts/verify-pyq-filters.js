const prisma = require('../backend/src/config/db');

async function verifyPYQFilters() {
  console.log('=== VERIFYING PYQ FILTERS IN BACKEND & DATABASE ===\n');
  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failures++;
    } else {
      console.log(`✅ PASSED: ${message}`);
    }
  }

  // 1. Total PYQs
  const total = await prisma.questionPaper.count({ where: { isVerified: true } });
  assert(total > 0, `Question papers exist in database (found ${total})`);

  // 2. Fetch courses & schemes
  const llb3 = await prisma.course.findUnique({ where: { code: '3YR-LLB' } });
  const ballb = await prisma.course.findUnique({ where: { code: '5YR-BALLB' } });
  const scheme80 = await prisma.scheme.findUnique({ where: { code: '80_MARKS' } });
  const scheme100 = await prisma.scheme.findUnique({ where: { code: '100_MARKS' } });

  assert(Boolean(llb3 && ballb), 'Courses 3YR-LLB and 5YR-BALLB found');
  assert(Boolean(scheme80 && scheme100), 'Schemes 80_MARKS and 100_MARKS found');

  // 3. Filter by Course
  const llb3Papers = await prisma.questionPaper.findMany({
    where: { isVerified: true, courseId: llb3.id }
  });
  assert(llb3Papers.length > 0, `Course filter: Found ${llb3Papers.length} papers for 3-Year LL.B`);
  assert(
    llb3Papers.every(p => p.courseId === llb3.id),
    'All returned papers belong strictly to 3-Year LL.B'
  );

  // 4. Filter by Scheme
  const s80Papers = await prisma.questionPaper.findMany({
    where: { isVerified: true, schemeId: scheme80.id }
  });
  assert(s80Papers.length > 0, `Scheme filter: Found ${s80Papers.length} papers for Scheme 80 Marks`);
  assert(
    s80Papers.every(p => p.schemeId === scheme80.id),
    'All returned papers have schemeId matching Scheme 80 Marks'
  );

  const s100Papers = await prisma.questionPaper.findMany({
    where: { isVerified: true, schemeId: scheme100.id }
  });
  assert(s100Papers.length > 0, `Scheme filter: Found ${s100Papers.length} papers for Scheme 100 Marks`);

  // 5. Filter by Exam Year
  const y2024Papers = await prisma.questionPaper.findMany({
    where: { isVerified: true, examYear: 2024 }
  });
  assert(y2024Papers.length > 0, `Exam Year filter: Found ${y2024Papers.length} papers for 2024`);
  assert(
    y2024Papers.every(p => p.examYear === 2024),
    'All returned papers have examYear = 2024'
  );

  const y2023Papers = await prisma.questionPaper.findMany({
    where: { isVerified: true, examYear: 2023 }
  });
  assert(y2023Papers.length > 0, `Exam Year filter: Found ${y2023Papers.length} papers for 2023`);

  // 6. Filter by Course + Semester + Scheme + Year combined
  const sem1 = await prisma.semester.findFirst({
    where: { courseId: llb3.id, semesterNumber: 1 }
  });
  assert(Boolean(sem1), 'Semester 1 found for 3-Year LL.B');

  const combinedPapers = await prisma.questionPaper.findMany({
    where: {
      isVerified: true,
      courseId: llb3.id,
      semesterId: sem1.id,
      schemeId: scheme80.id,
      examYear: 2024
    }
  });
  assert(
    combinedPapers.length > 0,
    `Combined filter (3YR-LLB + Sem 1 + Scheme 80 + 2024): Found ${combinedPapers.length} papers`
  );

  console.log(`\n========================================`);
  if (failures === 0) {
    console.log('🎉 ALL PYQ FILTER VERIFICATIONS PASSED!');
  } else {
    console.error(`💥 ${failures} CHECKS FAILED!`);
  }
  console.log(`========================================\n`);

  await prisma.$disconnect();
  process.exit(failures > 0 ? 1 : 0);
}

verifyPYQFilters().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
