const prisma = require('../backend/src/config/db');

async function verifyCoursesDataMapping() {
  console.log('=== STARTING COMPLETE COURSESDATA.JS MAPPING VERIFICATION ===\n');
  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failures++;
    } else {
      console.log(`✅ PASSED: ${message}`);
    }
  }

  // 1. Check all 5 courses exist
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
    },
    orderBy: { code: 'asc' }
  });

  assert(courses.length === 5, `Expected 5 courses, got ${courses.length}`);

  const llb3 = courses.find(c => c.code === '3YR-LLB');
  const ballb = courses.find(c => c.code === '5YR-BALLB');
  const bballb = courses.find(c => c.code === '5YR-BBALLB');
  const bcomllb = courses.find(c => c.code === '5YR-BCOMLLB');
  const bsclb = courses.find(c => c.code === '5YR-BSCLB');

  assert(Boolean(llb3), '3-Year LL.B course exists');
  assert(Boolean(ballb), 'B.A. LL.B course exists');
  assert(Boolean(bballb), 'B.B.A. LL.B course exists');
  assert(Boolean(bcomllb), 'B.Com. LL.B course exists');
  assert(Boolean(bsclb), 'B.Sc. LL.B course exists');

  // 2. Check Semester Counts
  assert(llb3.semesters.length === 6, `3-Year LL.B has exactly 6 semesters (got ${llb3.semesters.length})`);
  assert(
    !llb3.semesters.some(s => s.semesterNumber > 6),
    '3-Year LL.B has NO semesters above Semester 6 (Semesters 7-10 strictly absent)'
  );

  assert(ballb.semesters.length === 10, `B.A. LL.B has exactly 10 semesters (got ${ballb.semesters.length})`);
  assert(bballb.semesters.length === 10, `B.B.A. LL.B has exactly 10 semesters (got ${bballb.semesters.length})`);
  assert(bcomllb.semesters.length === 10, `B.Com. LL.B has exactly 10 semesters (got ${bcomllb.semesters.length})`);
  assert(bsclb.semesters.length === 10, `B.Sc. LL.B has exactly 10 semesters (got ${bsclb.semesters.length})`);

  // 3. Check 3-Year LL.B Exact Subject Codes
  const llb3Sem1 = llb3.semesters.find(s => s.semesterNumber === 1);
  const llb3Sem1Codes = llb3Sem1.subjects.map(s => s.code);
  const expectedLlb3Sem1 = ['KSLU-3Y-101', 'KSLU-3Y-102', 'KSLU-3Y-103', 'KSLU-3Y-104', 'KSLU-3Y-105', 'KSLU-3Y-106'];
  assert(
    JSON.stringify(llb3Sem1Codes) === JSON.stringify(expectedLlb3Sem1),
    `3-Year LL.B Sem 1 subjects match: ${llb3Sem1Codes.join(', ')}`
  );

  const llb3Sem6 = llb3.semesters.find(s => s.semesterNumber === 6);
  const llb3Sem6Codes = llb3Sem6.subjects.map(s => s.code);
  const expectedLlb3Sem6 = ['KSLU-3Y-601', 'KSLU-3Y-602', 'KSLU-3Y-603', 'KSLU-3Y-604', 'KSLU-3Y-605'];
  assert(
    JSON.stringify(llb3Sem6Codes) === JSON.stringify(expectedLlb3Sem6),
    `3-Year LL.B Sem 6 subjects match: ${llb3Sem6Codes.join(', ')}`
  );

  // 4. Check B.A. LL.B Semesters 1-4 Stream Specific
  const baSem1 = ballb.semesters.find(s => s.semesterNumber === 1);
  const baSem1Codes = baSem1.subjects.map(s => s.code);
  const expectedBaSem1 = ['KSLU-BA-101', 'KSLU-BA-102', 'KSLU-BA-103', 'KSLU-BA-104', 'KSLU-BA-105'];
  assert(
    JSON.stringify(baSem1Codes) === JSON.stringify(expectedBaSem1),
    `B.A. LL.B Sem 1 subjects match: ${baSem1Codes.join(', ')}`
  );

  // 5. Check B.B.A. LL.B Semesters 1-4 Stream Specific
  const bbaSem1 = bballb.semesters.find(s => s.semesterNumber === 1);
  const bbaSem1Codes = bbaSem1.subjects.map(s => s.code);
  const expectedBbaSem1 = ['KSLU-BBA-101', 'KSLU-BBA-102', 'KSLU-BBA-103', 'KSLU-BBA-104', 'KSLU-BBA-105'];
  assert(
    JSON.stringify(bbaSem1Codes) === JSON.stringify(expectedBbaSem1),
    `B.B.A. LL.B Sem 1 subjects match: ${bbaSem1Codes.join(', ')}`
  );

  // 6. Check B.Com. LL.B Sem 2
  const comSem2 = bcomllb.semesters.find(s => s.semesterNumber === 2);
  const comSem2Codes = comSem2.subjects.map(s => s.code);
  const expectedComSem2 = ['KSLU-COM-201', 'KSLU-COM-202', 'KSLU-COM-203', 'KSLU-COM-204', 'KSLU-COM-205'];
  assert(
    JSON.stringify(comSem2Codes) === JSON.stringify(expectedComSem2),
    `B.Com. LL.B Sem 2 subjects match: ${comSem2Codes.join(', ')}`
  );

  // 7. Check B.Sc. LL.B Sem 4
  const scSem4 = bsclb.semesters.find(s => s.semesterNumber === 4);
  const scSem4Codes = scSem4.subjects.map(s => s.code);
  const expectedScSem4 = ['KSLU-SC-401', 'KSLU-SC-402', 'KSLU-SC-403', 'KSLU-SC-404'];
  assert(
    JSON.stringify(scSem4Codes) === JSON.stringify(expectedScSem4),
    `B.Sc. LL.B Sem 4 subjects match: ${scSem4Codes.join(', ')}`
  );

  // 8. Check Integrated Common Core Law Semesters 5 to 10 across all 4 integrated programs
  const integratedCourses = [ballb, bballb, bcomllb, bsclb];
  for (let semNum = 5; semNum <= 10; semNum++) {
    const sets = integratedCourses.map(course => {
      const sem = course.semesters.find(s => s.semesterNumber === semNum);
      return sem.subjects.map(sub => sub.code);
    });

    // Check all 4 sets are identical
    const refCodes = sets[0];
    const allMatch = sets.every(sCodes => JSON.stringify(sCodes) === JSON.stringify(refCodes));
    assert(
      allMatch,
      `Integrated Sem ${semNum} subjects are common across all 4 courses: ${refCodes.join(', ')}`
    );

    // Check all codes start with KSLU-INT-
    assert(
      refCodes.every(code => code.startsWith('KSLU-INT-')),
      `All Integrated Sem ${semNum} codes start with 'KSLU-INT-'`
    );
  }

  // 9. Check NO Cross Bleeding
  // BA sem 1 codes must not be in BBA, BCom, or BSc
  const bbaAllCodes = bballb.semesters.flatMap(s => s.subjects.map(sub => sub.code));
  const hasBaBleed = baSem1Codes.some(c => bbaAllCodes.includes(c));
  assert(!hasBaBleed, 'Zero cross-stream bleeding: B.A. LL.B subjects do NOT appear in B.B.A. LL.B');

  // 3-Year LLB codes must not be in any integrated course
  const llb3AllCodes = llb3.semesters.flatMap(s => s.subjects.map(sub => sub.code));
  const has3YrBleed = integratedCourses.some(ic => {
    const icCodes = ic.semesters.flatMap(s => s.subjects.map(sub => sub.code));
    return llb3AllCodes.some(c => icCodes.includes(c));
  });
  assert(!has3YrBleed, 'Zero cross-stream bleeding: 3-Year LL.B subjects do NOT appear in 5-Year Integrated courses');

  // 10. Check Total Subjects in Database
  const totalSubjects = await prisma.subject.count();
  assert(totalSubjects === 205, `Total synced subjects in DB is exactly 205 (found ${totalSubjects})`);

  console.log(`\n========================================`);
  if (failures === 0) {
    console.log('🎉 ALL 17 COURSESDATA.JS MAPPING CHECKS PASSED PERFECTLY!');
  } else {
    console.error(`💥 ${failures} CHECKS FAILED!`);
  }
  console.log(`========================================\n`);

  await prisma.$disconnect();
  process.exit(failures > 0 ? 1 : 0);
}

verifyCoursesDataMapping().catch(err => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
