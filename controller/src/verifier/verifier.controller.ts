import { Controller, Body, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerifierService } from './verifier.service';

/**
 *
 */
@Controller('v1/verifier')
@ApiTags('verifier')
export class VerifierController {

    constructor(private readonly verifierService: VerifierService) {}

    @Post('verify')
    public async verify(@Body() body: any) {
        return await this.verifierService.verify(body.proof_profile_path, body.connection_id);
    }

    /**
     * Verify using the escrow service
     * TODO body.data should become the DTO that's the same as the one passed to the key guardian,
     *      perhaps our key guardian facade should expose it's DTOs somehow
     */
    @Post('escrow-verify')
    public async escrowVerify(@Body() body: any) {
        return await this.verifierService.escrowVerify(body.data, body.proof_profile_path);
    }

}
