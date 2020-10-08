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
 *   Dev : docker exec -it demo-controller ts-node /www/implementations/demo/scripts/setup.demo.ts
 *   Prod: docker exec -it demo-controller node /www/dist/implementations/demo/scripts/setup.demo.js
 */
class SetupDemo {

    private readonly http: ProtocolHttpService;
    // TODO pull these from configs
    private stewardUrl = 'http://kiva-controller:3011';
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

        // steward: onboard as endorser
        const profile = this.fetchValues('implementations/demo/profiles/profile.json');
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.stewardUrl + '/v1/steward/endorser',
            data: profile
        });
        Logger.log(res.data);

        // issuer: publicize did
        res = await this.http.requestWithRetry({
            method: 'POST',
            url: this.selfUrl + '/v1/agent/publicize-did',
            data: {
                did: profile.did
            }
        });
        Logger.log(res.data);

        // issuer: create cred def
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
