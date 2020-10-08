import { Module, HttpModule } from '@nestjs/common';
import { IssuerService } from './issuer.service';
import { IssuerController } from './issuer.controller';
import { GlobalCacheModule } from '../app/global.cache.module';
import { ImplementationService } from '../implementation/implementation.service';
import { ImplementationModule } from '../implementation/implementation.module';
import { AgentCaller } from '../agent/agent.caller';
import { AgentService } from '../agent/agent.service';

/**
 *
 */
@Module({
    imports: [
        HttpModule,
        GlobalCacheModule,
        ImplementationModule.register(process.env.IMPLEMENTATION_MODULE_PATH, process.env.IMPLEMENTATION_MODULE_NAME)
    ],
    controllers: [IssuerController],
    providers: [
        IssuerService,
        AgentService,
        AgentCaller,
        ImplementationService
    ],
    exports: [
        IssuerService,
        AgentService
    ]
})
export class IssuerModule {}
