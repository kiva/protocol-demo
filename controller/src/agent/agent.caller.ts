import { Injectable, HttpService, CacheStore, Inject, CACHE_MANAGER } from '@nestjs/common';
import { ProtocolHttpService } from 'protocol-common/protocol.http.service';
import { AxiosRequestConfig } from 'axios';
import { Logger } from 'protocol-common/logger';
import { ProtocolException } from 'protocol-common/protocol.exception';

/**
 * TODO add types
 * TODO add more comments
 */
@Injectable()
export class AgentCaller {

    private readonly http: ProtocolHttpService;

    /**
     * TODO just using a cache for now, but eventually may want to use a postgres DB or take another approach eg manually set agentId and port
     */
    constructor(
        httpService: HttpService,
        @Inject(CACHE_MANAGER) private readonly cache: CacheStore
    ) {
        this.http = new ProtocolHttpService(httpService);
    }

    /**
     * Makes a call to the agency to spin up an agent
     * TODO right now we check the cache on our side, the agency should also make sure it doesn't spin up the same agent twice
     * TODO it might be simplier if some of these args came form process.env instead of being passed in
     */
    public async spinUpAgent(
        walletId: string,
        walletKey: string,
        adminApiKey: string,
        seed?: string,
        controllerUrl?: string,
        agentId?: string,
        label?: string,
    ): Promise<any> {
        const req: AxiosRequestConfig = {
            method: 'POST',
            url: process.env.AGENCY_URL + '/v1/manager',
            data: {
                walletId,
                walletKey,
                adminApiKey,
                seed,
                controllerUrl,
                agentId,
                label,
                ttl: 2147483, // This is the max ttl supported by setTimeout - TODO swap this to 0 when the agency is ready for it
                autoConnect: false,
            }
        };
        Logger.log(`Spinning up agent ${agentId}`);
        const res = await this.http.requestWithRetry(req);
        Logger.log(`Successfully spun up agent ${agentId}`);
        return res.data;
    }

    /**
     * TODO we can abstract away the method and route to just be a command that looks up the method and route
     */
    public async callAgent(agentId: string, apiKey: string, method: any, route: string, params?: any, data?: any): Promise<any> {
        const url = `http://${agentId}:${process.env.AGENT_ADMIN_PORT}/${route}`;
        const req: AxiosRequestConfig = {
            method,
            url,
            params,
            data,
            headers: {
                'x-api-key': apiKey,
            },
        };
        // TODO remove logging or make cleaner
        try {
            Logger.log(`Calling agent ${url}`);
            const res = await this.http.requestWithRetry(req);
            return res.data;
        } catch (e) {
            Logger.error(`Agent call failed ${url}`, e);
            // TODO add 'AgentCallFailed' to ProtocolErrorCode
            throw new ProtocolException('AgentCallFailed', `Agent: ${e.message}`, { agentRoute: route });
        }
    }

    /**
     * TODO maybe we never actually want to do this... perhaps we can remove
     */
    public async spinDownAgent(agentId: string) {
        const req: AxiosRequestConfig = {
            method: 'DELETE',
            url: process.env.AGENCY_URL + '/v1/manager',
            data: {
                agentId,
            }
        };
        // TODO even if the request fails we should still remove from the cache
        const res = await this.http.requestWithRetry(req);
        Logger.log(`Spun down agent for ${agentId}`);
        return res.data;
    }
}
