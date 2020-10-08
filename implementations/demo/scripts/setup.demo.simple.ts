import { HttpService } from '@nestjs/common';
import { Logger } from 'protocol-common/logger';
import { ProtocolHttpService } from 'protocol-common/protocol.http.service';
import { readFileSync } from 'fs';

/**
 * Convenience script to setup the Demo agent as a steward without needing a kiva controller
 * 
 * Currently this requires 2 different ways of running for dev and prod - eventually we should get this working in both
 *   Dev : docker exec -it demo-controller ts-node /www/implementations/demo/scripts/setup.demo.simple.ts
 *   Prod: docker exec -it demo-controller node /www/dist/implementations/demo/scripts/setup.demo.simple.js
 */
class SetupDemo {

    private readonly http: ProtocolHttpService;
    // TODO pull these from configs
    private selfUrl = 'http://localhost:3014';

    constructor(http?: HttpService) {
        this.http = new ProtocolHttpService(http || new HttpService());
    }

    public async run() {
        try {
            await this.setup();
        } catch(e) {
            Logger.log(e);
        }
    }

    /**
     * Onboard endorser, publicize did, create cred def
     */
    private async setup() {
        let res;

        // steward: publicize did
        const profile = this.fetchValues('implementations/demo/profiles/profile.json');
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.selfUrl + '/v1/agent/publicize-did',
            data: {
                did: profile.did
            }
        });
        Logger.log(res.data);

        // steward: create schema
        const schema = this.fetchValues('implementations/demo/profiles/kyc.schema.json');
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.selfUrl + '/v1/steward/schema',
            data: schema
        });
        Logger.log(res.data);

        // steward: create cred def
        const credDef = this.fetchValues('implementations/demo/profiles/demo.cred.def.json');
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.selfUrl + '/v1/issuer/cred-def',
            data: credDef
        });
        Logger.log(res.data);
    }

    // TEMP HACK - in a later refactor (PRO-2285) we'll sort out the file structure difference between dev and prod, for now we try both
    private fetchValues(file) {
        let fileJson;
        try {
            // Try prod first
            fileJson = JSON.parse(readFileSync('/www/dist/' + file).toString());
        } catch (e) {
            // If that doesn't work try dev
            fileJson = JSON.parse(readFileSync('/www/' + file).toString());
        }
        const envValues = {...fileJson.DEFAULT, ...fileJson[process.env.NODE_ENV]};
        return envValues;
    }
}

(new SetupDemo()).run();
