import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AgentService } from './agent.service';

/**
 * TODO may want to rename to general instead of agent
 */
@Controller('v1/agent')
@ApiTags('agent')
export class AgentController {

    constructor(private readonly agentService: AgentService) {}

    // -- General -- //
    @Post()
    public async init() {
        return await this.agentService.init();
    }

    @Post('open-connection')
    public async openConnection() {
        return await this.agentService.openConnection();
    }

    @Post('accept-connection')
    public async acceptConnection(@Body() body: any) {
        return await this.agentService.acceptConnection(body.alias, body.invitation);
    }

    @Post('publicize-did')
    public async publicizeDid(@Body() body: any) {
        return await this.agentService.publicizeDid(body.did);
    }
}
