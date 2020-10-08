import { Injectable, HttpService, Inject, CACHE_MANAGER, CacheStore } from '@nestjs/common';
import { ProtocolHttpService } from 'protocol-common/protocol.http.service';

/**
 * TODO this needs to handle general requests that come from the agents for the controller to handle -
 * it should have some way of checking what it's behavior should be and respond accordingly
 */
@Injectable()
export class AgentControllerService {

    private readonly http: ProtocolHttpService;

    constructor(
        httpService: HttpService,
        @Inject(CACHE_MANAGER) private readonly cache: CacheStore) {
        this.http = new ProtocolHttpService(httpService);
    }

    async handleRequest(route: string, topic: string, body: any) {
        // For now let's not do anything
        return 'success';

        // TODO leaving some of this code around - eventually we probably want a way to custom respond to each request

        // const agent: any = await this.cache.get(agentId);
        // const agentUrl = `http://${agentId}:${agent.adminPort}`;
        // let req: AxiosRequestConfig;
        // // Ad hoc throwing in custom logic, TODO move this to separate handler functions for each topic
        // if (topic === 'connections') {
        //     if (body.initiator === 'self') {
        //         Logger.log('self initiated request, nothing to handle');
        //         return;
        //     }

        //     // If this is an external invitation then accept-invitation
        //     if (body.state === 'invitation') {
        //         Logger.log('...processing invitation')
        //         req = {
        //             method: 'POST',
        //             url: agentUrl + `/connections/${body.connection_id}/accept-invitation`,
        //             headers: {
        //                 'x-api-key': agent.adminApiKey,
        //             }
        //         };
        //     } else if (body.state === 'request') {
        //         Logger.log('...processing request')
        //         req = {
        //             method: 'POST',
        //             url: agentUrl + `/connections/${body.connection_id}/accept-request`,
        //             headers: {
        //                 'x-api-key': agent.adminApiKey,
        //             }
        //         };
        //     } else if (body.state === 'response') {
        //         // Sending a ping to show-case the connection worked
        //         Logger.log('...processing response')
        //         req = {
        //             method: 'POST',
        //             url: agentUrl + `/connections/${body.connection_id}/send-ping`,
        //             headers: {
        //                 'x-api-key': agent.adminApiKey,
        //             },
        //             data: {
        //                 comment: 'Test connection'
        //             }
        //         };

        //     } else {
        //         throw new ProtocolException('Unknown', `Unknown state for 'connection' ${body.state}`);
        //     }
        //     Logger.log(`...calling ${req.url}`);
        //     const res = await this.http.requestWithRetry(req);
        //     return 'success'; // TODO should we just return success? or something else?
        // }
    }
}
