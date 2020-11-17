import { Module, forwardRef } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { AgentModule } from 'aries-controller/agent/agent.module';
import { IssuerModule } from 'aries-controller/issuer/issuer.module';
import { VerifierModule } from 'aries-controller/verifier/verifier.module';

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
