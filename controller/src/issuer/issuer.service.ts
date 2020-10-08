import { Injectable, HttpService } from '@nestjs/common';
import {readFileSync} from 'fs';
import { Logger } from 'protocol-common/logger';
import { ProtocolHttpService } from 'protocol-common/protocol.http.service';
import { ProtocolException } from 'protocol-common/protocol.exception';
import { ProtocolErrorCode } from 'protocol-common/protocol.errorcode';
import { ImplementationService } from '../implementation/implementation.service';
import { AgentCaller } from '../agent/agent.caller';
import { AgentService } from '../agent/agent.service';
import { Services } from '../utility/services';


/**
 * TODO it may be better to have the IssuerService extend the Agent/General Service rather than passing it in
 */
@Injectable()
export class IssuerService {

    constructor(
        public readonly agentService: AgentService,
        private readonly agentCaller: AgentCaller,
        private readonly implementationService: ImplementationService,
    ) {}

    public async createCredDef(schema_id: string, tag: string, support_revocation: boolean) {
        const data = {
            schema_id,
            tag,
            support_revocation,
        };
        return await this.agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'POST', 'credential-definitions', null, data);
    }

    /**
     * TODO in a future refactor we're going to eliminate the implementation service fetchEntityData and formatDataForCredential calls
     *      and then this will become the de facto issueCredential
     */
    public async issueCredentialDirect(credDefProfilePath: string, connectionId: string, attributes: Array<any>): Promise<string> {
        const credentialData: any = this.getCredDefAndSchemaData(credDefProfilePath);
        credentialData.connection_id = connectionId;
        credentialData.credential_proposal.attributes = attributes;
        return await this.agentCaller.callAgent(
            process.env.AGENT_ID,
            process.env.ADMIN_API_KEY,
            'POST',
            'issue-credential/send',
            null,
            credentialData
        );
    }

    public async issueCredential(credDefProfilePath: string, connectionId: string, entityId?: string, entityData?: any): Promise<string> {
        const credentialData: any = this.getCredDefAndSchemaData(credDefProfilePath);
        credentialData.connection_id = connectionId;
        entityData = entityData || await this.implementationService.fetchEntityData(entityId);
        const attributes = this.implementationService.formatDataForCredential(entityData);
        credentialData.credential_proposal.attributes = attributes;
        return await this.agentCaller.callAgent(
            process.env.AGENT_ID,
            process.env.ADMIN_API_KEY,
            'POST',
            'issue-credential/send',
            null,
            credentialData
        );
    }

    /**
     * Fetches data about the entity, enrolls them in the key guardian, and issues them a credential
     * TODO need to figure out rollbacks
     */
    public async onboardEntity(credDefProfilePath: string, entityId: string) {
        // Fetch entity data
        const entityData = await this.implementationService.fetchEntityData(entityId);
        Logger.log('Fetched entity data');
        const keyGuardRes = await this.enrollInKeyGuardian(entityData);
        Logger.log('Enrolled in Key Guardian');
        const connectionRes = await this.agentService.acceptConnection(keyGuardRes.id, keyGuardRes.connectionData);
        Logger.log('Accepted connection invitation');
        const connectionId = connectionRes.connection_id;

        if (false === await Services.waitForAcceptedConnection(connectionId, this.agentCaller)) {
            throw new ProtocolException(ProtocolErrorCode.INTERNAL_SERVER_ERROR, 'connection was not established', null, 500);
        }

        // TODO the ping is not really needed and can be removed eventually - useful for seeing where things are failing
        const pingRes = await this.agentService.sendPing(connectionId);
        Logger.log('Ping sent');
        const issueCredRes = await this.issueCredential(credDefProfilePath, connectionId, entityId, entityData);
        Logger.log('Credential Issued');
        // TODO we may want to manually spin down the holder's agent and delete the connection
        // For now we just return the agent id
        return {
            agentId: keyGuardRes.id
        };
    }

    /**
     * TODO move this functionality to a key guardian facade
     * TODO we should update the key guardian enroll function to take multiple plugins,
     */
    private async enrollInKeyGuardian(entityData: any) {
        // TODO when this is in it's own class inject the http service
        const http = new ProtocolHttpService(new HttpService());

        // TODO for now breaking this into 2 steps, 1 for fingerprints 1 for SMS - eventually the key guardian should support multiple plugins at once
        entityData.pluginType = 'FINGERPRINT';
        const data = await this.implementationService.formatDataForKeyGuardian(entityData);
        const req: any = {
            method: 'POST',
            url: process.env.KEY_GUARDIAN_URL + '/v1/escrow/create', // TODO change to 'enroll'
            data
        };
        Logger.log('Fingerprint entry created');
        const res = await http.requestWithRetry(req);
        const returnData = res.data;
        const id = res.data.id;

        entityData.pluginType = 'SMS_OTP';
        const smsData = await this.implementationService.formatDataForKeyGuardian(entityData);
        smsData.id = id;
        const smsReq: any = {
            method: 'POST',
            url: process.env.KEY_GUARDIAN_URL + '/v1/escrow/add', // TODO change to 'enroll'
            data: smsData
        };
        Logger.log('SMS entry created');
        const smsRes = await http.requestWithRetry(smsReq);
        return returnData;
    }

    /**
     * TODO better error handling
     */
    private getCredDefAndSchemaData(credDefProfilePath: string) {
        const prefix = __dirname + process.env.PROFILES_PATH;
        const credDefProfileString = readFileSync(prefix + credDefProfilePath).toString();
        if (!credDefProfileString) {
            throw new Error(`Failed to load profile ${credDefProfilePath}`);
        }
        const credDefProfileJson = JSON.parse(credDefProfileString);
        const credDefProfile = {...credDefProfileJson.DEFAULT, ...credDefProfileJson[process.env.NODE_ENV]};

        delete credDefProfile.attributes;
        delete credDefProfile.schema_profile;
        delete credDefProfile.tag;

        // Allow for overriding cred def id if present (since cred def id is the most variable amongst environments)
        if (process.env.CRED_DEF_ID) {
            credDefProfile.cred_def_id = process.env.CRED_DEF_ID;
        }
        return credDefProfile;
    }

    public async checkCredentialExchange(credentialExchangeId: string): Promise<any> {
        try {
            return await this.agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'GET', `issue-credential/records/${credentialExchangeId}`);
        } catch (e) {
            throw new ProtocolException(ProtocolErrorCode.VALIDATION_EXCEPTION, e.message);
        }
    }
}
