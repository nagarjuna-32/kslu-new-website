const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app } = require('../server');
const prisma = require('../config/db');

test('KSLU Circle Full End-to-End Workflow Integration Test', async (t) => {
  let studentToken = '';
  let studentUserId = '';
  let studentEmail = '';
  let adminToken = '';
  let testCourseId = '';
  let testSemesterId = '';
  let testSubjectId = '';
  let samplePYQId = '';
  let uploadedNoteId = '';

  t.after(async () => {
    // Cleanup any temporary created records if needed, then disconnect prisma
    if (uploadedNoteId) {
      await prisma.notification.deleteMany({ where: { userId: studentUserId } }).catch(() => {});
      await prisma.vote.deleteMany({ where: { studyMaterialId: uploadedNoteId } }).catch(() => {});
      await prisma.bookmark.deleteMany({ where: { studyMaterialId: uploadedNoteId } }).catch(() => {});
      await prisma.studyMaterial.delete({ where: { id: uploadedNoteId } }).catch(() => {});
    }
    if (studentUserId) {
      await prisma.downloadLog.deleteMany({ where: { userId: studentUserId } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { userId: studentUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: studentUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  // Step 1: Student Registration
  await t.test('1. Student Registration creates a new user account with role USER', async () => {
    studentEmail = `flow.student.${Date.now()}@kslucircle.org`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'E2E Workflow Student',
        email: studentEmail,
        password: 'SecurePassword@123',
        collegeName: 'University Law College, Bangalore'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, 'USER');
    assert.strictEqual(res.body.data.user.email, studentEmail);

    studentToken = res.body.data.token;
    studentUserId = res.body.data.user.id;
  });

  // Step 2: Student Login
  await t.test('2. Student Login authenticates credentials and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentEmail,
        password: 'SecurePassword@123'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    studentToken = res.body.data.token;
  });

  // Step 3: Fetch Academic Hierarchy Data
  await t.test('3. Fetch Academic Hierarchy (Courses, Semesters, Subjects)', async () => {
    const courseRes = await request(app).get('/api/academic/courses');
    assert.strictEqual(courseRes.status, 200);
    assert.ok(courseRes.body.data.courses.length > 0);
    
    // Pick the 3-Year LL.B course
    const course = courseRes.body.data.courses.find(c => c.code === '3YR-LLB') || courseRes.body.data.courses[0];
    testCourseId = course.id;

    const semRes = await request(app).get(`/api/academic/courses/${testCourseId}/semesters`);
    assert.strictEqual(semRes.status, 200);
    assert.ok(semRes.body.data.semesters.length > 0);
    testSemesterId = semRes.body.data.semesters[0].id;

    const subRes = await request(app).get(`/api/academic/subjects?courseId=${testCourseId}&semesterId=${testSemesterId}`);
    assert.strictEqual(subRes.status, 200);
    assert.ok(subRes.body.data.subjects.length > 0);
    testSubjectId = subRes.body.data.subjects[0].id;

    assert.ok(testCourseId);
    assert.ok(testSemesterId);
    assert.ok(testSubjectId);
  });

  // Step 4: Browse PYQs & View Single PYQ
  await t.test('4. Browse Question Papers & inspect preview metadata', async () => {
    const listRes = await request(app).get('/api/pyqs?page=1&limit=10');
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.data.items.length > 0);

    const firstPyq = listRes.body.data.items[0];
    samplePYQId = firstPyq.id;

    const detailRes = await request(app)
      .get(`/api/pyqs/${samplePYQId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.body.data.pyq.id, samplePYQId);
    assert.ok(detailRes.body.data.pyq.fileUrl);
  });

  // Step 5: Download Tracking
  await t.test('5. PYQ Download endpoint increments download count', async () => {
    const beforePyq = await prisma.questionPaper.findUnique({ where: { id: samplePYQId } });
    const initialCount = beforePyq.downloadCount;

    const dlRes = await request(app)
      .get(`/api/pyqs/${samplePYQId}/download`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.ok([200, 302].includes(dlRes.status));

    const afterPyq = await prisma.questionPaper.findUnique({ where: { id: samplePYQId } });
    assert.strictEqual(afterPyq.downloadCount, initialCount + 1);
  });

  // Step 6: Student Uploads Study Note (Multipart with PDF)
  await t.test('6. Student Uploads Study Note with PDF attachment (Status PENDING)', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (E2E Test Note) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    const res = await request(app)
      .post('/api/notes/upload')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('title', 'Comprehensive Notes on Constitutional Law E2E')
      .field('description', 'Detailed analytical study guide for semester examination.')
      .field('courseId', testCourseId)
      .field('semesterId', testSemesterId)
      .field('subjectId', testSubjectId)
      .field('tags', 'Constitution,FundamentalRights,Article21')
      .attach('file', fakePdfBuffer, 'constitutional-law-notes.pdf');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.note.id);
    assert.strictEqual(res.body.data.note.status, 'PENDING');
    assert.strictEqual(res.body.data.note.uploadedById, studentUserId);

    uploadedNoteId = res.body.data.note.id;

    // Check submission notification was generated for student
    const notifs = await prisma.notification.findMany({
      where: { userId: studentUserId }
    });
    assert.ok(notifs.some(n => n.title.includes('Submitted for Review')));
  });

  // Step 7: Note is NOT publicly visible while PENDING
  await t.test('7. Pending note is excluded from public study notes library', async () => {
    const res = await request(app)
      .get('/api/notes?search=Constitutional Law E2E');

    assert.strictEqual(res.status, 200);
    const found = res.body.data.items.find(n => n.id === uploadedNoteId);
    assert.strictEqual(found, undefined, 'Pending note must not appear in public query results');
  });

  // Step 8: Admin Authentication
  await t.test('8. Admin logs in with verified credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@kslucircle.org',
        password: 'Admin@2025!'
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, 'ADMIN');
    adminToken = res.body.data.token;
  });

  // Step 9: Admin Moderation List shows pending note
  await t.test('9. Admin moderation queue lists the pending note', async () => {
    const res = await request(app)
      .get('/api/notes/admin/all?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    const found = res.body.data.items.find(n => n.id === uploadedNoteId);
    assert.ok(found, 'Pending note should appear in admin moderation queue');
  });

  // Step 10: Admin Approves Note
  await t.test('10. Admin approves note, triggering status change and notification dispatch', async () => {
    const res = await request(app)
      .post(`/api/notes/admin/${uploadedNoteId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.note.status, 'APPROVED');

    // Verify DB update
    const noteInDb = await prisma.studyMaterial.findUnique({ where: { id: uploadedNoteId } });
    assert.strictEqual(noteInDb.status, 'APPROVED');
    assert.ok(noteInDb.approvedAt);
  });

  // Step 11: Notification Dispatch Verification
  await t.test('11. Student receives an APPROVAL notification for published resource', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data.notifications));
    const approvalNotif = res.body.data.notifications.find(n => n.type === 'APPROVAL');
    assert.ok(approvalNotif, 'Student should receive an APPROVAL notification');
    assert.ok(approvalNotif.message.includes('approved'));
  });

  // Step 12: Note is now publicly visible
  await t.test('12. Approved note is now publicly visible in study notes library', async () => {
    const res = await request(app)
      .get('/api/notes?search=Constitutional Law E2E');

    assert.strictEqual(res.status, 200);
    const found = res.body.data.items.find(n => n.id === uploadedNoteId);
    assert.ok(found, 'Approved note must be visible in public search');
    assert.strictEqual(found.status, 'APPROVED');
  });

  // Step 13: Student Bookmarks the Note
  await t.test('13. Student bookmarks the note and retrieves it in personal bookmarks', async () => {
    const bmRes = await request(app)
      .post(`/api/notes/${uploadedNoteId}/bookmark`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(bmRes.status, 200);
    assert.strictEqual(bmRes.body.data.isBookmarked, true);

    // Verify note detail shows isBookmarked = true
    const detailRes = await request(app)
      .get(`/api/notes/${uploadedNoteId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.body.data.note.isBookmarked, true);
  });

  // Step 14: Student Upvotes the Note
  await t.test('14. Student upvotes the note, updating upvotes count', async () => {
    const voteRes = await request(app)
      .post(`/api/notes/${uploadedNoteId}/vote`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ voteType: 'UPVOTE' });

    assert.strictEqual(voteRes.status, 200);
    assert.strictEqual(voteRes.body.data.userVote, 'UPVOTE');
    assert.strictEqual(voteRes.body.data.upvotesCount, 1);
  });
});
