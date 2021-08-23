const request = require('supertest');

let server;

describe('test all endpoints', () => {
  beforeEach(async () => {
    server = require('../server');
  });
  // afterEach(async () => {
  //   await server.close();
  // });

  describe('GET /order_items', () => {
    it('should return 401 if basic auth is not provided', async () => {
      const res = await request(server).get('/order_items');

      expect(res.status).toBe(401);
    });

    it('should receive a status code of 200 with login', async () => {
      const res = await request(server)
        .get('/order_items')
        .auth('3442f8959a84dea7ee197c632cb2df15', '13023')
        .set('Accept', 'application/json');

      expect(res.status).toBe(200);
    });
  });
});
