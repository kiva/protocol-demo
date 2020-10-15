import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProtocolValidationPipe } from 'protocol-common/protocol.validation.pipe';
import { IssuerService } from '../../../../src/issuer/issuer.service';
import { VerifierService } from '../../../../src/verifier/verifier.service';

/**
 * The pattern here is interesting because we just want to expose some endpoints on this controller that point down services in the common
 * protocol code. Perhaps we could just move this entire controller/module into common (and then make DRY with the RegisterController and MobileController for FSP)
 */
@Controller('v2/kyc')
@ApiTags('kyc')
export class KycController {

    constructor(
        private readonly issuerService: IssuerService,
        private readonly verifierService: VerifierService,
    ) {}

    /**
     * Runs KYC verification flow
     */
    @Post()
    async kyc(@Body(new ProtocolValidationPipe()) body: any): Promise<any> {
        return await this.verifierService.escrowVerify(body, 'demo.proof.request.json');
    }

    /**
     * Check status of connection
     */
    @Post('register')
    async register(@Body(new ProtocolValidationPipe()) body: any): Promise<any> {
        await this.issuerService.onboardEntity('demo.cred.def.json', body);
        return { success: true };
    }
}
