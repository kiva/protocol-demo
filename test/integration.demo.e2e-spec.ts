import request from 'supertest';
import { inspect } from 'util';
import { ProtocolUtility } from 'protocol-common/protocol.utility';

/**
 * The demo test runs through a sample flow where a new agent is registered, adds a schema + cred def, issues a credential and verifies it
 * It is meant to be run through once, some operations will fail on the second run through
 * It doesn't requite any scripts to be run, just:
 *   docker-compose up -d
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

    // Note that if you run the integration tests twice, this one will fail with a 400 already registered error.
    // So don't worry if that's the case, in CI it will only ever run once.
    it('Register demo agent in multi controller', async () => {
        const data = {
            "seed": "000000000000000000000000Steward2", // Register as steward to make setup simpler
            "label": "Demo Controller",
            "useTailsServer": false,
            "adminApiKey": "demoAdminApiKey"
        }
        return request(demoUrl)
            .post('/v2/api/agent/register')
            .set('agent', 'demo-agent')
            .send(data)
            .expect((res) => {
                try {
                    
                    expect(res.body.agentId).toBeDefined();
                } catch (e) {
                    e.message = e.message + '\nDetails: ' + inspect(res.body);
                    throw e;
                }
            });
    });

    it('Demo agent publicizes DID', async () => {
        await ProtocolUtility.delay(5000);
        const data = {
            "did": "EbP4aYNeTHL6q385GuVpRV",
        };
        return request(demoUrl)
            .post('/v1/agent/publicize-did')
            .set('agent', 'demo-agent')
            .send(data)
            .expect((res) => {
                try {
                    expect(res.status).toBe(201);
                    expect(res.body.result).toBeDefined();
                } catch (e) {
                    e.message = e.message + '\nDetails: ' + inspect(res.body);
                    throw e;
                }  
            });
    });

    it('Demo agent creates schema and cred def', async () => {
        await ProtocolUtility.delay(1000);
        const data = {
            "schemaName": "demo",
            "attributes": [
                "nationalId",
                "firstName",
                "lastName",
                "birthDate",
                "photo~attach"
            ]
        };
        return request(demoUrl)
            .post('/v2/api/schema-cred-def')
            .set('agent', 'demo-agent')
            .send(data)
            .expect(201)
            .expect((res) => {
                expect(res.body.schemaId).toBeDefined();
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
            .set('agent', 'demo-agent')
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
            .set('agent', 'demo-agent')
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
            .set('agent', 'demo-agent')
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

    it('Save a proof request profile', async () => {
        const data = {
            'profileName': 'test.proof.request.json',
            'profile': {
                'comment': 'Test proof request profile',
                'proof_request':{
                    'name': 'TestProofRequest',
                    'version':'1.0.0',
                    'requested_attributes':{
                        'nationalId':{
                            'name':'nationalId',
                            'restrictions': []
                        },
                        'firstName':{
                            'name':'firstName',
                            'restrictions': []
                        }
                    },
                    'requested_predicates':{}
                }
            }
        }
        return request(demoUrl)
            .post('/v2/api/profiles')
            .set('agent', 'demo-agent')
            .send(data)
            .expect((res) => {
                expect(res.status).toBe(201);
            });
    });

    it('Initiate verify request', async () => {
        await ProtocolUtility.delay(5000);
        const data = {
            connectionId: demoConnectionId,
            profile: 'test.proof.request.json',
        };
        return request(demoUrl)
            .post(`/v2/api/verify`)
            .set('agent', 'demo-agent')
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
            .set('agent', 'demo-agent')
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
