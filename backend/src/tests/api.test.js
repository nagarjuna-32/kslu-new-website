const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app } = require('../server');
const prisma = require('../config/db');

test('KSLU Circle Backend API Suite', async (t) => {
  let authToken = '';
  let testUserId = '';

  t.after(async () => {
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
    const randomEmail = `test.student.${Date.now()}@kslucircle.org`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test Student',
        email: randomEmail,
        password: 'Password@123',
        collegeName: 'Bangalore Law College'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.user.id);
    testUserId = res.body.data.user.id;
  });

  await t.test('5. POST /api/auth/login should authenticate seeded student', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@kslucircle.org',
        password: 'Student@2025!'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, 'student@kslucircle.org');
    authToken = res.body.data.token;
  });

  await t.test('6. GET /api/auth/me should return current student profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.email, 'student@kslucircle.org');
  });

  await t.test('7. GET /api/pyqs should return paginated list of question papers', async () => {
    const res = await request(app).get('/api/pyqs?page=1&limit=10');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.items.length >= 1);
    assert.ok(res.body.data.pagination);
  });

  await t.test('8. GET /api/notes should return approved notes', async () => {
    const res = await request(app).get('/api/notes?page=1&limit=10');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.items.length >= 1);
  });

  await t.test('9. GET /api/community/discussions should return forum threads', async () => {
    const res = await request(app).get('/api/community/discussions');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.items.length >= 1);
  });

  await t.test('10. GET /api/announcements should return university updates', async () => {
    const res = await request(app).get('/api/announcements');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.items.length >= 1);
  });

  await t.test('11. GET /api/career should return career opportunities', async () => {
    const res = await request(app).get('/api/career');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.items.length >= 1);
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
});
