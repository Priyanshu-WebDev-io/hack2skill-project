const request = require('supertest');
const app = require('../src/index.js');
const mongoose = require('mongoose');

describe('Backend API Integration Tests', () => {
  
  // Close the mongoose connection after all tests to prevent open handles
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /health', () => {
    it('should return 200 OK and a timestamp', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/seminars', () => {
    it('should fetch the list of seminars', async () => {
      const response = await request(app).get('/api/seminars');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
