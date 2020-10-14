import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProtocolValidationPipe } from 'protocol-common/protocol.validation.pipe';
import { IssueDto } from './issue.dto';
import { AgentService } from '../../../../src/agent/agent.service';
import { IssuerService } from '../../../../src/issuer/issuer.service';
import { VerifierService } from '../../../../src/verifier/verifier.service';
import { DataService } from '../data.service';

/**
 * The pattern here is interesting because we just want to expose some endpoints on this controller that point down services in the common
 * protocol code. Perhaps we could just move this entire controller/module into common (and then make DRY with the RegisterController and MobileController for FSP)
 */
@Controller('v2/mobile')
@ApiTags('mobile')
export class MobileController {

    constructor(
        private readonly agentService: AgentService,
        private readonly issuerService: IssuerService,
        private readonly verifierService: VerifierService,
    ) {}

    /**
     * Create connection for mobile agent to receive
     */
    @Post('connection')
    async createConnection(): Promise<any> {
        return await this.agentService.openConnection();
    }

    /**
     * Check status of connection
     */
    @Get('connection/:connectionId')
    async checkConnection(@Param('connectionId') connectionId: string): Promise<any> {
        return await this.agentService.checkConnection(connectionId);
    }

    /**
     * Issue credential to connection
     * 
     * One thing that would be cool to figure out is if a credential definition can have a subset of fields of it's schema, we only really need:
     * "attributes": [
            "nationalId",
            "firstName",
            "lastName",
            "birthDate",
            "photo~attach"
        ]
     * For now those I just blank out the values we don't need
     */
    @Post('issue')
    async registerMobile(@Body(new ProtocolValidationPipe()) body: IssueDto): Promise<any> {
        const attributes = (new DataService()).formatDataForCredential(body);
        // @tothink hard-coding the profile data here for simplicity but as soon as we have 2 possible profiles we'll let the client decide
        return await this.issuerService.issueCredentialDirect('demo.cred.def.json', body.connectionId, attributes);
    }


    /**
     * Check status of credential being issued
     */
    @Get('issue/:credentialExchangeId')
    async checkCredential(@Param('credentialExchangeId') credentialExchangeId: string): Promise<any> {
        return await this.issuerService.checkCredentialExchange(credentialExchangeId);
    }

        /**
     * Initiate proof exchange
     */
    @Post('verify')
    public async verify(@Body() body: any) {
        return await this.verifierService.verify(body.proof_profile_path, body.connection_id);
    }

    /**
     * Check status of presentation exchange
     */
    @Get('verify/:presExId')
    async checkPresEx(@Param('presExId') presExId: string): Promise<any> {
        return await this.verifierService.checkPresEx(presExId);
    }
}
