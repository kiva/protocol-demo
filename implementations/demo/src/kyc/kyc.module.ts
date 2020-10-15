import { Module, forwardRef } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { AgentModule } from '../../../../src/agent/agent.module';
import { IssuerModule } from '../../../../src/issuer/issuer.module';
import { VerifierModule } from '../../../../src/verifier/verifier.module';

/**
 *
 */
@Module({
    imports: [
        AgentModule,
        forwardRef(() => IssuerModule),
        VerifierModule,
    ],
    controllers: [KycController],
    providers: [],
})
export class KycModule {}
