const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await User.deleteMany({ email: /testuser/ }); // Clean up test users
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'Test@1234';

  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should not signup with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(409);
  });

  it('should not signup with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: testEmail });
    expect(res.statusCode).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPass123' });
    expect(res.statusCode).toBe(401);
  });

  it('should not login with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@example.com', password: testPassword });
    expect(res.statusCode).toBe(401);
  });

  it('should not login with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail });
    expect(res.statusCode).toBe(400);
  });
}); 