import request from 'supertest';

/**
 * Integration test for our app, this ensures that the production docker image was built correctly
 * This expects the docker containers to be running and return a healthy response
 */
describe('Prod integration test', () => {

    it('Demo Controller up', () => {
        return request('http://localhost:3014')
        .get('/healthz')
        .expect(200);
    });
});