import { Module, forwardRef } from '@nestjs/common';
import { MobileController } from './mobile.controller';
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
    controllers: [MobileController],
    providers: [],
})
export class MobileModule {}
