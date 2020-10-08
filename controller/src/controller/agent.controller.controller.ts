import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Logger } from 'protocol-common/logger';
import { AgentControllerService } from './agent.controller.service';

/**
 * This handles all the controller responses to our agents
 * TODO is the GET needed or does the agent only ever POST?
 * TODO will there every be more subroutes? or are there ever just 2
 * TODO are there ever params or only just the body?
 */
@Controller('v1/controller')
@ApiTags('controller')
export class AgentControllerController {

    constructor(private readonly agentControllerService: AgentControllerService) {}

    @Get(':route/:subroute')
    async getController(
        @Param('route') route: string,
        @Param('subroute') subroute: string,
        @Body() body: any
    ): Promise<any> {
        Logger.log('----- GET WEB HOOK START -----');
        Logger.log(`${route}/${subroute}`, body);
        Logger.log('----- GET WEB HOOK END -----');
        return await this.agentControllerService.handleRequest(route, subroute, body);
    }

    @Post(':route/:subroute')
    async postController(
        @Param('route') route: string,
        @Param('subroute') subroute: string,
        @Body() body: any
    ): Promise<any> {
        Logger.log('----- POST WEB HOOK START -----');
        Logger.log(`${route}/${subroute}`, body);
        Logger.log('----- POST WEB HOOK END -----');
        return await this.agentControllerService.handleRequest(route, subroute, body);
    }

}
