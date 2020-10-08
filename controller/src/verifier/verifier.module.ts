import { Module, HttpModule } from '@nestjs/common';
import { VerifierService } from './verifier.service';
import { VerifierController } from './verifier.controller';
import { AgentModule } from '../agent/agent.module';
import { AgentService } from '../agent/agent.service';
import { AgentCaller } from '../agent/agent.caller';

/**
 *
 */
@Module({
    imports: [
        AgentModule,
        HttpModule,
    ],
    controllers: [VerifierController],
    providers: [
        VerifierService,
        AgentService,
        AgentCaller,
    ],
    exports: [VerifierService]
})
export class VerifierModule {}
