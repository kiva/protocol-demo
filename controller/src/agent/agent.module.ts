import { Module, HttpModule } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { AgentCaller } from './agent.caller';
import { GlobalCacheModule } from '../app/global.cache.module';

/**
 *
 */
@Module({
    imports: [
        HttpModule,
        GlobalCacheModule,
    ],
    controllers: [AgentController],
    providers: [
        AgentService,
        AgentCaller,
    ],
    exports: [
        AgentService,
        AgentCaller,
    ]
})
export class AgentModule {}
