import request from 'supertest';
import { readFileSync } from 'fs';
import { inspect } from 'util';

/**
 * 
 */
describe('Full system eKYC integration tests for register and kyc flows', () => {
    let fingerprintRegister: string;
    let fingerprintKyc: string;
    let device: any;
    let voterId: number;
    let nationalId: string;
    let registerData: any;

    beforeAll(() => {
        // Note that the register endpoint expects images hex encoded, and the kyc endpoint base64
        fingerprintRegister = readFileSync('./images/fingerprint1.png').toString('hex');
        fingerprintKyc = readFileSync('./images/fingerprint1.png').toString('base64');
        voterId = 1000000 + parseInt(Date.now().toString().substr(7, 6), 10); // Predictable and unique exact 7 digits that doesn't start with 0
        nationalId = 'N' + voterId;
        device = {
            FingerprintSensorSerialNumber: 'xyz123',
            TellerComputerUsername: 'testTeller',
        };
        registerData = {
            nationalId,
            firstName: 'First',
            lastName: 'Last',
            birthDate: '1955-11-12 00:00:00',
            faceImage: '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da6364f8ffbf1e000584027fc25b1e2a00000000',
            fingerprints: [
                {
                    image: fingerprintRegister,
                    position: 1,
                },
            ],
        };
        jest.setTimeout(60000); // The first request is slow as it needs to create the wallet and fingerprint templates
    });

    it('Register new user', () => {
        return request(process.env.DEMO_CONTROLLER_URL)
            .post('/v2/kyc/register')
            .send(registerData)
            .expect((res) => {
                try {
                    expect(res.status).toBe(201);
                    expect(res.body.success).toBe(true);
                } catch (e) {
                    e.message = e.message + '\nDetails: ' + inspect(res.body);
                    throw e;
                }
            });
    });

    it('KYC registered user', () => {
        const data = {
            pluginType: 'FINGERPRINT',
            filters: {
                nationalId,
            },
            params: {
                image: fingerprintKyc,
                position: 1,
            },
            position: 1,
            device,
        };

        return request(process.env.DEMO_CONTROLLER_URL)
            .post('/v2/kyc')
            .send(data)
            .expect((res) => {
                try {
                    expect(res.status).toBe(201);
                    expect(res.body.nationalId).toBe(nationalId);
                } catch (e) {
                    e.message = e.message + '\nDetails: ' + inspect(res.body);
                    throw e;
                }
            });
    });
});
