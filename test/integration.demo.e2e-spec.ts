import request from 'supertest';
import { inspect } from 'util';
import { ProtocolUtility } from 'protocol-common/protocol.utility';

/**
 * The demo test is a very specific test to make sure the pieces for the demo work
 *
 * These tests are designed to be run after the following steps:
 *   docker-compose up -d
 *   docker exec -it demo-controller node /www/scripts/setup.demo.js
 */
describe('Full system eKYC integration tests for demo issue and verify flows', () => {
    const demoUrl = 'http://localhost:3014';
    const agencyUrl = 'http://localhost:3010';
    let connectionData: any;
    let demoConnectionId: string;
    let credentialExchangeId: string;
    let presExId: string;

    beforeAll(() => {
        jest.setTimeout(60000);
    });

    it('Spin up new test agent', async () => {
        const data = {
            agentId: 'test',
            walletId: 'testId1',
            walletKey: 'testKey1',
            adminApiKey: 'testApiKey1',
        };
        return request(agencyUrl)
            .post('/v1/manager')
            .send(data)
            .expect((res) => {
                expect(res.status).toBe(201);
                expect(res.body.connectionData).toBeDefined();
                connectionData = res.body.connectionData;
            });
    });

    it('Register demo agent in multi controller', async () => {
        const data = {
            "walletId": "demoWalletId",
            "walletKey": "demoWalletKey",
            "seed": "000000000000000000000000Steward2",
            "label": "Demo Controller",
            "useTailsServer": false,
            "agentId": "demoAgent",
            "adminApiKey": "demoAdminApiKey"
        }
        return request(demoUrl)
            .post('/v1/agent/register')
            .set('agent', 'demoAgent')
            .send(data)
            .expect((res) => {
                expect(res.status).toBe(201);
                expect(res.body.agentId).toBeDefined();
            });
    });

    it('Demo agent publicizes DID', async () => {
        await ProtocolUtility.delay(5000);
        const data = {
            "did": "EbP4aYNeTHL6q385GuVpRV",
        };
        return request(demoUrl)
            .post('/v1/agent/publicize-did')
            .set('agent', 'demoAgent')
            .send(data)
            .expect(201)
            .expect((res) => {
                expect(res.body.result).toBeDefined();
            });
    });

    it('Demo agent creates schema', async () => {
        await ProtocolUtility.delay(1000);
        const data = {
            "schema_name": "Identity",
            "schema_version": "1.0.0",
            "attributes": [
                "nationalId",
                "firstName",
                "lastName",
                "birthDate",
                "photo~attach"
            ]
        };
        return request(demoUrl)
            .post('/v1/steward/schema')
            .set('agent', 'demoAgent')
            .send(data)
            .expect(201)
            .expect((res) => {
                expect(res.body.schema_id).toBeDefined();
            });
    });

    it('Demo agent creates cred def', async () => {
        await ProtocolUtility.delay(1000);
        const data = {
            "schema_id": "EbP4aYNeTHL6q385GuVpRV:2:Identity:1.0.0",
            "tag": "tag1",
            "support_revocation": false
        };
        return request(demoUrl)
            .post('/v1/issuer/cred-def')
            .set('agent', 'demoAgent')
            .send(data)
            .expect(201)
            .expect((res) => {
                expect(res.body.credential_definition_id).toBeDefined();
            });
    });

    it('Demo agent connects to test agent', async () => {
        await ProtocolUtility.delay(1000);
        const data = {
            alias: 'demo',
            invitation: connectionData,
        };
        return request(demoUrl)
            .post('/v1/agent/accept-connection')
            .set('agent', 'demoAgent')
            .send(data)
            .expect(201)
            .expect((res) => {
                expect(res.body.connection_id).toBeDefined();
                demoConnectionId = res.body.connection_id;
            });
    });

    it('Check connection', async () => {
        await ProtocolUtility.delay(3000);
        return request(demoUrl)
            .get(`/v2/api/connection/${demoConnectionId}`)
            .set('agent', 'demoAgent')
            .expect(200)
            .expect((res) => {
                expect(res.body.state).toBe('response');
            });
    });

    it('Issue credential for mobile', async () => {
        await ProtocolUtility.delay(2000);
        const issueData: any = {
            entityData: {
                nationalId: 'ABC123',
                firstName: 'First',
                lastName: 'Last',
                birthDate: '1975-10-10 00:00:00',
                'photo~attach': '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da6364f8ffbf1e000584027fc25b1e2a00000000',
            },
            connectionId: demoConnectionId,
            profile: 'demo.cred.def.json'
        };
        return request(demoUrl)
            .post('/v2/api/issue')
            .set('agent', 'demoAgent')
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
        await ProtocolUtility.delay(5000);
        const data = {
            connectionId: demoConnectionId,
            profile: 'demo.proof.request.json',
        };
        return request(demoUrl)
            .post(`/v2/api/verify`)
            .set('agent', 'demoAgent')
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
        await ProtocolUtility.delay(5000);
        return request(demoUrl)
            .get(`/v2/api/verify/${presExId}`)
            .set('agent', 'demoAgent')
            .expect(200)
            .expect((res) => {
                expect(res.body.state).toBe('verified');
                expect(res.body.presentation.requested_proof.revealed_attrs.firstName.raw).toBe('First');
            });
    });

    it('Spin down test agent', async () => {
        await ProtocolUtility.delay(1000);
        const data = {
            agentId: 'test'
        };
        return request(agencyUrl)
            .delete('/v1/manager')
            .send(data)
            .expect(200);
    });
});
