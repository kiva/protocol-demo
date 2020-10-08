import request from 'supertest';
import { inspect } from 'util';

/**
 * Tests the issuer and verifier flows against the demo controller
 * For simplicity hitting the microservices directly instead of going through the gateway, so this test only needs one external repo:
 *   aries-guardianship-agency/docker-compose.ci.yml
 * Assumes that simple_start.sh script has been run
 */
describe('Full system integration tests for mobile issue and verify flows', () => {
    let invitation: any;
    let demoConnectionId: string;
    let credentialExchangeId: string;
    let presExId: string;

    const delayFunc = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    beforeAll(() => {
        jest.setTimeout(60000);
    });

    it('Create connection to demo agent', () => {
        return request(process.env.DEMO_CONTROLLER_URL)
            .post('/v2/mobile/connection')
            .expect(201)
            .expect((res) => {
                console.log(res.body);
                expect(res.body.invitation).toBeDefined();
                expect(res.body.invitation.label).toBe('Civil Registry Office');
            });
    });

    it('Spin up a fake mobile agent (really aca py)', async () => {
        const data = {
            agentId: 'mobileAgent',
            walletId: 'walletIdMobile',
            walletKey: 'walletKeyMobile',
            adminApiKey: 'mobileApiKey',
        };
        return request(process.env.AGENCY_CONTROLLER_URL)
            .post('/v1/manager')
            .send(data)
            .expect(201)
            .expect((res) => {
                console.log(res.body);
                expect(res.body.connectionData).toBeDefined();
                invitation = res.body.connectionData;
            });
    });

    // Normally the mobile agent would receive the demo agent's connection, but we can't control the mobile agent directly
    it('Demo agent receives demo connection invite', async () => {
        await delayFunc(3000);
        const data = {
            invitation,
            alias: 'mobile-agent',
        }
        return request(process.env.DEMO_CONTROLLER_URL)
            .post('/v1/agent/accept-connection')
            .send(data)
            .expect(201)
            .expect((res) => {
                expect(res.body.connection_id).toBeDefined();
                demoConnectionId = res.body.connection_id;
            });
    });

    it('Check connection', async () => {
        await delayFunc(5000);
        return request(process.env.DEMO_CONTROLLER_URL)
            .get(`/v2/mobile/connection/${demoConnectionId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.state).toBe('response');
            });
    });

    it('Issue credential to mobile', async () => {
        const issueData: any = {
            nationalId: 'ABC123',
            firstName: 'First',
            lastName: 'Last',
            birthDate: '1975-10-10 00:00:00',
            faceImage: '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da6364f8ffbf1e000584027fc25b1e2a00000000',
            connectionId: demoConnectionId,
        };
        return request(process.env.DEMO_CONTROLLER_URL)
            .post('/v2/mobile/issue')
            .send(issueData)
            .expect((res) => {
                try {
                    expect(res.status).toBe(201);
                    expect(res.body.state).toBe('offer_sent');
                    expect(res.body.credential_exchange_id).toBeDefined();
                    credentialExchangeId = res.body.credential_exchange_id;
                } catch (e) {
                    e.message = e.message + '\nDetails: ' + inspect(res.body);
                    throw e;
                }
            });
    });

    it('Initiate verify request', async () => {
        await delayFunc(5000);
        const data = {
            connection_id: demoConnectionId,
            proof_profile_path: 'demo.proof.request.json',
        };
        return request(process.env.DEMO_CONTROLLER_URL)
            .post(`/v2/mobile/verify`)
            .send(data)
            .expect((res) => {
                try {
                    expect(res.status).toBe(201);
                    expect(res.body.state).toBe('request_sent');
                    expect(res.body.presentation_exchange_id).toBeDefined();
                    presExId = res.body.presentation_exchange_id;
                } catch (e) {
                    e.message = e.message + '\nDetails: ' + inspect(res.body);
                    throw e;
                }
            });
    });

    it('Check presentation', async () => {
        await delayFunc(5000);
        return request(process.env.DEMO_CONTROLLER_URL)
            .get(`/v2/mobile/verify/${presExId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.state).toBe('verified');
                expect(res.body.presentation.requested_proof.revealed_attrs.firstName.raw).toBe('First');
            });
    });

    it('Spin down mobile agent', () => {
        const data = {
            agentId: 'mobileAgent',
        };
        return request(process.env.AGENCY_CONTROLLER_URL)
            .delete('/v1/manager')
            .send(data)
            .expect(200);
    });
});
