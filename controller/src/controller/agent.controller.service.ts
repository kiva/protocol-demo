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

    /**
     * Currently we use the default controller provided by the agency
     * TODO eventually the issuer and verifier specific webhooks should be handled here
     */
    async handleRequest(route: string, topic: string, body: any) {
        // For now let's not do anything
        return 'success';
    }
}
