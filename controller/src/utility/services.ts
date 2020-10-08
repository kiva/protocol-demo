import { ProtocolUtility } from 'protocol-common/protocol.utility';
import { AgentCaller } from '../agent/agent.caller';

export class Services {

    public static async waitForAcceptedConnection(credentialId: string, agentCaller: AgentCaller): Promise<boolean> {
        const startOf: Date = new Date();
        const waitMS: number = parseInt(process.env.CONNECTION_WAIT_SEC, 10) * 1000;

        // we want to poll the agent every so often to see if/when the connection is completely set up
        // (aka state === active).
        while (waitMS > ProtocolUtility.timeDelta(new Date(), startOf)) {

            // just so we do not spam the agent, wait a bit before making a call
            await ProtocolUtility.delay(1000);
            const connection = await agentCaller.callAgent(process.env.AGENT_ID, process.env.ADMIN_API_KEY, 'GET', `connections/${credentialId}`);
            // toThink(): we have these states and status spread out among several projects and source files.
            // TODO: should we make some shared constants?
            // Either of these 2 states is good enough to continue with the interaction
            if (connection.state === 'active' || connection.state === 'response') {
                return true;
            }
        }

        return false;
    }
}
