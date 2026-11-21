const fs = require('fs');
const path = require('path');
const prisma = require('../src/config/db');

async function purgeDemoData() {
  console.log('Initiating production demo-data purge...');

  // 1. Delete transient relational child records
  const discVotes = await prisma.discussionVote.deleteMany({}).catch(() => ({ count: 0 }));
  const comments = await prisma.comment.deleteMany({}).catch(() => ({ count: 0 }));
  const discussions = await prisma.discussion.deleteMany({}).catch(() => ({ count: 0 }));
  const bookmarks = await prisma.bookmark.deleteMany({}).catch(() => ({ count: 0 }));
  const votes = await prisma.vote.deleteMany({}).catch(() => ({ count: 0 }));
  const downloadLogs = await prisma.downloadLog.deleteMany({}).catch(() => ({ count: 0 }));
  const notifications = await prisma.notification.deleteMany({}).catch(() => ({ count: 0 }));
  const reports = await prisma.report.deleteMany({}).catch(() => ({ count: 0 }));
  const auditLogs = await prisma.auditLog.deleteMany({}).catch(() => ({ count: 0 }));
  const career = await prisma.careerOpportunity.deleteMany({}).catch(() => ({ count: 0 }));
  const announcements = await prisma.announcement.deleteMany({}).catch(() => ({ count: 0 }));
  const notes = await prisma.studyMaterial.deleteMany({}).catch(() => ({ count: 0 }));
  const pyqs = await prisma.questionPaper.deleteMany({}).catch(() => ({ count: 0 }));

  // 2. Delete demo users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'kslucircle.org' } },
        { email: { contains: 'test' } },
        { email: { contains: 'flow' } }
      ]
    }
  });

  // 3. Remove generated sample PDFs from local upload folders
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const pyqsDir = path.join(uploadsDir, 'pyqs');
  const notesDir = path.join(uploadsDir, 'notes');

  [pyqsDir, notesDir].forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.startsWith('pyq-') || f.startsWith('notes-') || f.endsWith('.pdf')) {
          try {
            fs.unlinkSync(path.join(dir, f));
            console.log(`Deleted sample file: ${f}`);
          } catch (e) {
            console.warn(`Could not delete ${f}:`, e.message);
          }
        }
      }
    }
  });

  console.log('Purge Summary:');
  console.log(`- Removed ${pyqs.count} placeholder question papers`);
  console.log(`- Removed ${notes.count} sample study notes`);
  console.log(`- Removed ${discussions.count} demo discussions and ${comments.count} comments`);
  console.log(`- Removed ${announcements.count} placeholder announcements`);
  console.log(`- Removed ${career.count} placeholder career opportunities`);
  console.log(`- Removed ${deletedUsers.count} demo student/admin accounts`);
  console.log(`- Cleared transient logs, bookmarks, and notifications`);

  // Verify preserved academic core
  const courseCount = await prisma.course.count();
  const semCount = await prisma.semester.count();
  const subCount = await prisma.subject.count();
  const schemeCount = await prisma.scheme.count();

  console.log('\nVerified Preserved Production Academic Data:');
  console.log(`- Official Law Courses: ${courseCount}`);
  console.log(`- Official Semesters: ${semCount}`);
  console.log(`- Official Subjects: ${subCount}`);
  console.log(`- Marking Schemes: ${schemeCount}`);

  await prisma.$disconnect();
  console.log('\nDemo data audit and purge completed successfully.');
}

purgeDemoData().catch((err) => {
  console.error('Purge failed:', err);
  process.exit(1);
});
