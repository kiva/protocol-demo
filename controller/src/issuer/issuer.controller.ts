import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IssuerService } from './issuer.service';

/**
 *
 */
@Controller('v1/issuer')
@ApiTags('issuer')
export class IssuerController {

    constructor(private readonly issuerService: IssuerService) {}

    @Post('cred-def')
    public async createCredDef(@Body() body: any) {
        return await this.issuerService.createCredDef(body.schema_id, body.tag, body.support_revocation);
    }

    /**
     * Need to pass the cred def profile (stored in profiles/public), the connection id, and the entity id you want to issue the credential for
     */
    @Post('issue')
    public async issueCredential(@Body() body: any) {
        return await this.issuerService.issueCredential(body.credDefProfile, body.connectionId, body.entityId);
    }

    @Post('onboard')
    public async onboardEntity(@Body() body: any) {
        return await this.issuerService.onboardEntity(body.credDefProfile, body.entityId);
    }
}
