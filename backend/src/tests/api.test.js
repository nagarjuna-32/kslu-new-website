const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app } = require('../server');
const prisma = require('../config/db');

test('KSLU Circle Backend API Suite', async (t) => {
  let authToken = '';
  let testUserId = '';
  let testStudentEmail = '';

  t.after(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  await t.test('1. GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  await t.test('2. GET /api/academic/courses should list official KSLU law courses', async () => {
    const res = await request(app).get('/api/academic/courses');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.courses));
    assert.ok(res.body.data.courses.length >= 5);

    const codes = res.body.data.courses.map(c => c.code);
    assert.ok(codes.includes('3YR-LLB'));
    assert.ok(codes.includes('5YR-BALLB'));
  });

  await t.test('3. GET /api/academic/subjects should return subjects list', async () => {
    const res = await request(app).get('/api/academic/subjects');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.subjects.length > 0);
  });

  await t.test('4. POST /api/auth/register should create a new student account', async () => {
    testStudentEmail = `test.student.${Date.now()}@kslucircle.org`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test Student',
        email: testStudentEmail,
        password: 'Password@123',
        collegeName: 'Bangalore Law College'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.user.id);
    testUserId = res.body.data.user.id;
  });

  await t.test('5. POST /api/auth/login should authenticate registered student', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudentEmail,
        password: 'Password@123'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, testStudentEmail);
    authToken = res.body.data.token;
  });

  await t.test('6. GET /api/auth/me should return current student profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.email, testStudentEmail);
  });

  await t.test('7. GET /api/pyqs should return paginated list of question papers', async () => {
    const res = await request(app).get('/api/pyqs?page=1&limit=10');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
    assert.ok(res.body.data.pagination);
  });

  await t.test('8. GET /api/notes should return approved notes', async () => {
    const res = await request(app).get('/api/notes?page=1&limit=10');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
  });

  await t.test('9. GET /api/community/discussions should return forum threads', async () => {
    const res = await request(app).get('/api/community/discussions');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
  });

  await t.test('10. GET /api/announcements should return university updates', async () => {
    const res = await request(app).get('/api/announcements');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
  });

  await t.test('11. GET /api/career should return career opportunities', async () => {
    const res = await request(app).get('/api/career');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
  });

  await t.test('12. GET /api/academic/stats should return real platform statistics', async () => {
    const res = await request(app).get('/api/academic/stats');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.stats);
    assert.ok(typeof res.body.data.stats.totalPYQs === 'number');
    assert.ok(typeof res.body.data.stats.totalNotes === 'number');
    assert.ok(typeof res.body.data.stats.totalStudents === 'number');
    assert.ok(typeof res.body.data.stats.totalDownloads === 'number');
  });

  await t.test('12. POST /api/ai/explain should return pedagogical explanation', async () => {
    const res = await request(app)
      .post('/api/ai/explain')
      .send({
        concept: 'Damnum Sine Injuria',
        subject: 'Law of Torts'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.explanation.length > 50);
    assert.ok(res.body.data.explanation.includes('DISCLAIMER'));
  });

  await t.test('13. GET /api/notes/categories-count should return counts for all 4 categories', async () => {
    const res = await request(app).get('/api/notes/categories-count');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.counts);
    assert.strictEqual(typeof res.body.data.counts.STUDY_NOTES, 'number');
    assert.strictEqual(typeof res.body.data.counts.IMPORTANT_QUESTIONS, 'number');
    assert.strictEqual(typeof res.body.data.counts.REFERENCE_BOOKS, 'number');
    assert.strictEqual(typeof res.body.data.counts.CASE_LAWS, 'number');
    assert.strictEqual(typeof res.body.data.counts.TOTAL, 'number');
  });

  await t.test('14. GET /api/notes?category=STUDY_NOTES should filter resources by category', async () => {
    const res = await request(app).get('/api/notes?category=STUDY_NOTES&page=1&limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
  });
});
