import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProtocolValidationPipe } from 'protocol-common/protocol.validation.pipe';
import { IssueDto } from './issue.dto';
import { AgentService } from 'aries-controller/agent/agent.service';
import { IssuerService } from 'aries-controller/issuer/issuer.service';
import { VerifierService } from 'aries-controller/verifier/verifier.service';

/**
 * TODO remove this code once the front end is no longer using it, it has been replace with the generic api controller
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
     *       "nationalId",
     *       "firstName",
     *       "lastName",
     *       "birthDate",
     *       "photo~attach"
     *   ]
     * For now those I just blank out the values we don't need
     */
    @Post('issue')
    async registerMobile(@Body(new ProtocolValidationPipe()) body: IssueDto): Promise<any> {
        // TODO this logic should live somewhere else - but waiting till after the big refactor to decide where
        // Note because we're using a schema with more fields, we need to blank them all out
        const mapping = {
            'nationalId': body.nationalId,
            'nationalIssueDate': '',
            'voterId': '',
            'voterIssueDate': '',
            'firstName': body.firstName,
            'middleName': '',
            'lastName': body.lastName,
            'gender': '',
            'birthDate': body.birthDate,
            'birthPlace': '',
            'residentialAddress': '',
            'permanentAddress': '',
            'phoneNumber': '',
            'motherFirstName': '',
            'motherLastName': '',
            'fatherFirstName': '',
            'fatherLastName': '',
            'occupation': '',
            'maritalStatus': '',
            'signature~attach': '',
        };
        // And then map to the way Aries wants it
        const attributes = [];
        for (const key of Object.keys(mapping)) {
            attributes.push({
                name: key,
                value: mapping[key],
            });
        }

        // Special handling for images
        // @tothink historically we expected hex images and manually did the conversion to base64 here - we could just have the client pass
        attributes.push({
            name: 'photo~attach',
            value: Buffer.from(body.faceImage, 'hex').toString('base64'),
            'mime-type': 'text/plain'
        });

        // @tothink hard-coding the profile data here for simplicity but as soon as we have 2 possible profiles we'll let the client decide
        return await this.issuerService.issueCredentialUsingProfile('demo.cred.def.json', body.connectionId, attributes);
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
