import { Injectable } from '@nestjs/common';
import { AgentCaller } from '../agent/agent.caller';

/**
 *
 */
@Injectable()
export class StewardService {

    constructor(private readonly agentCaller: AgentCaller) {}

    public async createSchema(schema_name: string, schema_version: string, attributes: Array<string>) {
        const data = {
            schema_name,
            schema_version,
            attributes,
        };
        return await this.agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'POST', 'schemas', null, data);
    }

    public async onboardEndorser(did: string, verkey: string, alias: string): Promise<any> {
        const params = {
            did,
            verkey,
            alias,
            role: 'ENDORSER'
        };
        return await this.agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'POST', 'ledger/register-nym', params);
    }


}
