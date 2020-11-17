import { HttpService } from '@nestjs/common';
import { Logger } from 'protocol-common/logger';
import { ProtocolHttpService } from 'protocol-common/protocol.http.service';
import { readFileSync } from 'fs';

/**
 * Convenience script to setup the Demo agent as an issuer
 * Note that right now we need to run this script after the kiva setup script which make the Demo did public on the ledger as an endorser
 * Note this expects the demo and kiva controllers are running
 * TODO make robust to different existing states
 *
 * Currently this requires 2 different ways of running for dev and prod - eventually we should get this working in both
 *   Dev : docker exec -it demo-controller npm run script:dev /www/src/scripts/setup.demo.ts
 *   Prod: docker exec -it demo-controller node /www/scripts/setup.demo.js
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
            process.exit(1);
        }
    }

    /**
     * Publicize did, create schema, create cred def
     */
    private async setup() {
        let res;

        // publicize did
        const profile = this.fetchValues('profiles/profile.json');
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.selfUrl + '/v1/agent/publicize-did',
            data: {
                did: profile.did
            }
        });
        Logger.log(res.data);

        // steward: create employee schema
        const schema = this.fetchValues('profiles/demo.schema.json');
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.selfUrl + '/v1/steward/schema',
            data: schema
        });
        Logger.log(res.data);

        // issuer: create cred def
        const credDef = this.fetchValues('profiles/demo.cred.def.json');
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.selfUrl + '/v1/issuer/cred-def',
            data: credDef
        });
        Logger.log(res.data);
    }

    private fetchValues(file) {
        const fileJson = JSON.parse(readFileSync('/www/' + file).toString());
        const envValues = {...fileJson.DEFAULT, ...fileJson[process.env.NODE_ENV]};
        return envValues;
    }
}

(new SetupDemo()).run();
