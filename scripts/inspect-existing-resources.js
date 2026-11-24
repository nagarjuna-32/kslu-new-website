const prisma = require('../backend/src/config/db');

async function check() {
  const noteCount = await prisma.studyMaterial.count();
  const pyqCount = await prisma.questionPaper.count();
  const subjectCount = await prisma.subject.count();
  console.log(`Current DB counts: ${subjectCount} subjects, ${noteCount} notes, ${pyqCount} PYQs`);

  const notes = await prisma.studyMaterial.findMany({
    select: { id: true, title: true, subjectId: true, courseId: true, semesterId: true }
  });
  console.log('Notes in DB:', notes);

  const pyqs = await prisma.questionPaper.findMany({
    select: { id: true, title: true, subjectId: true, courseId: true, semesterId: true }
  });
  console.log('PYQs in DB:', pyqs);

  await prisma.$disconnect();
}

check().catch(console.error);
