const prisma = require('../backend/src/config/db');

async function check() {
  console.log('Current Database Counts:');
  console.log('Courses:', await prisma.course.count());
  console.log('Semesters:', await prisma.semester.count());
  console.log('Subjects:', await prisma.subject.count());
  console.log('Schemes:', await prisma.scheme.count());
  console.log('Users:', await prisma.user.count());
  console.log('QuestionPapers:', await prisma.questionPaper.count());
  console.log('StudyMaterials:', await prisma.studyMaterial.count());
  console.log('Discussions:', await prisma.discussion.count());
  console.log('Comments:', await prisma.comment.count());
  console.log('Announcements:', await prisma.announcement.count());
  console.log('CareerOpportunities:', await prisma.careerOpportunity.count());
  console.log('Bookmarks:', await prisma.bookmark.count());
  console.log('Votes:', await prisma.vote.count());
  console.log('Notifications:', await prisma.notification.count());
  await prisma.$disconnect();
}

check().catch(console.error);
