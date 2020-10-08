import request from 'supertest';

/**
 * These tests probably won't stay around, I just wanted to get something going
 * Right now these are full integration tests because I couldn't get the agents deployed to docker from the test modules
 * TODO better tests
 */
describe('Agency Integration Tests', () => {
    const hostUrl = 'http://localhost:3012'; // We probably won't keep this notion around, but if we do move to config

    beforeAll(async () => {

    });

    it('Onboard an agent from citizen data', async () => {
        const data = {
            credDefProfile: 'ncra.kyc.cred.def.json',
            entityId: 'PZVN88R2'
        }
        return request(hostUrl)
            .post('/v1/agent/onboard')
            .send(data)
            .expect(201)
            .expect((res) => {
                console.log(res.body);
                expect(res.body.agentId).toBeDefined();
            });
    });

    // TODO we'll need to add some functionality to remove some from the escrow service to allow continous onboarding
    //   OR we could use the register endpoint to register a new person each time
    // TODO we'll need a way to spin down docker containers so they don't

});
