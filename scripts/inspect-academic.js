const prisma = require('../backend/src/config/db');

async function check() {
  const courses = await prisma.course.findMany({
    include: {
      semesters: { orderBy: { semesterNumber: 'asc' } },
      _count: { select: { subjects: true, studyMaterials: true } }
    }
  });
  console.log('Courses in DB:');
  for (const c of courses) {
    console.log(`Course: ${c.code} (${c.name}) - Semesters: ${c.semesters.length}, Subjects: ${c._count.subjects}, Notes: ${c._count.studyMaterials}`);
    console.log(`  Semesters: ${c.semesters.map(s => s.semesterNumber).join(', ')}`);
  }
  await prisma.$disconnect();
}

check().catch(console.error);
