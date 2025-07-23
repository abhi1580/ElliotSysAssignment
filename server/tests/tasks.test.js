const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
require('dotenv').config();

let token;
let taskId;
const testEmail = 'tasktestuser@example.com';
const testPassword = 'Test@1234';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: testEmail });
  await Task.deleteMany({});
  // Signup and login to get token
  await request(app).post('/api/auth/signup').send({ email: testEmail, password: testPassword });
  const res = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword });
  token = res.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: testEmail });
  await Task.deleteMany({});
  await mongoose.connection.close();
});

describe('Task Routes', () => {
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'A test task',
        dueDate: '2024-07-01',
        priority: 'high',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
    taskId = res.body._id;
  });

  it('should get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('should get a single task by ID', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(taskId);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Task', priority: 'medium' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.priority).toBe('medium');
  });

  it('should toggle task status', async () => {
    const res1 = await request(app)
      .patch(`/api/tasks/${taskId}/toggle`)
      .set('Authorization', `Bearer ${token}`);
    expect(res1.statusCode).toBe(200);
    expect(res1.body.status).toBe('complete');
    const res2 = await request(app)
      .patch(`/api/tasks/${taskId}/toggle`)
      .set('Authorization', `Bearer ${token}`);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.status).toBe('incomplete');
  });

  it('should filter tasks by status', async () => {
    await request(app)
      .patch(`/api/tasks/${taskId}/toggle`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .get('/api/tasks?status=complete')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.every(t => t.status === 'complete')).toBe(true);
  });

  it('should search tasks by title', async () => {
    const res = await request(app)
      .get('/api/tasks?search=Updated')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.some(t => t.title.includes('Updated'))).toBe(true);
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });
}); 