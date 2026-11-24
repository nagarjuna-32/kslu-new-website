const prisma = require('../backend/src/config/db');

async function check() {
  const subjects = await prisma.subject.findMany({
    include: {
      course: { select: { code: true, name: true } },
      semester: { select: { semesterNumber: true, title: true } }
    },
    orderBy: [
      { course: { code: 'asc' } },
      { semester: { semesterNumber: 'asc' } },
      { code: 'asc' }
    ]
  });
  console.log(`Total subjects: ${subjects.length}`);
  subjects.forEach(s => {
    console.log(`[${s.course.code}] Sem ${s.semester.semesterNumber}: ${s.code} - ${s.name}`);
  });
  await prisma.$disconnect();
}

check().catch(console.error);
