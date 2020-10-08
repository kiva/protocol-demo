import { Injectable } from '@nestjs/common';
import { AgentCaller } from './agent.caller';

/**
 * TODO abstract out a base service that includes things like making connections
 */
@Injectable()
export class AgentService {

    constructor(
        private readonly agentCaller: AgentCaller,
    ) {}

    /**
     * TODO we could add some error handling/retry logic here if the agent doesn't spin up correctly the first time
     */
    public async init(): Promise<any> {
        // One option is for this controller (at self url) to manage all the interactions,
        //   which would require a lot of overlap with the agency controller
        // The simpler option for right now is to use the agency's controller and specify a specific policy (eg issuer, verifier, etc)
        // const controllerUrl = process.env.SELF_URL + '/v1/controller';
        const controllerUrl = null;
        return await this.agentCaller.spinUpAgent(
            process.env.WALLET_ID,
            process.env.WALLET_KEY,
            process.env.ADMIN_API_KEY,
            process.env.SEED,
            controllerUrl,
            process.env.AGENT_ID,
            process.env.LABEL,
        );
    }

    public async openConnection(): Promise<any> {
        const data = await this.agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'POST', 'connections/create-invitation');
        data.invitation.imageUrl = process.env.IMAGE_URL || '';
        return data;
    }

    public async acceptConnection(alias: string, invitation: any) {
        const params = {
            alias
        };
        return await this.agentCaller.callAgent(
            process.env.AGENT_ID,
            process.env.ADMIN_API_KEY,
            'POST',
            'connections/receive-invitation',
            params,
            invitation
        );
    }

    public async checkConnection(connectionId: string): Promise<any> {
        return await this.agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'GET', `connections/${connectionId}`);
    }

    public async sendPing(connectionId: string, comment = 'ping') {
        const data = {
            comment
        };
        return await this.agentCaller.callAgent(
            process.env.AGENT_ID,
            process.env.ADMIN_API_KEY,
            'POST',
            `connections/${connectionId}/send-ping`,
            null,
            data,
        );
    }

    public async publicizeDid(did: string): Promise<any> {
        const params = {
            did,
        };
        return await this.agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'POST', 'wallet/did/public', params);
    }
}
