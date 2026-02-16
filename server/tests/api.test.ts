import request from 'supertest';
import app from '../src/index';

describe('api health', () => {
  it('responds on health route', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
