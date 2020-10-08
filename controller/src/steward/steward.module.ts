import { Module, HttpModule } from '@nestjs/common';
import { StewardService } from './steward.service';
import { StewardController } from './steward.controller';
import { AgentCaller } from '../agent/agent.caller';
import { GlobalCacheModule } from '../app/global.cache.module';

/**
 *
 */
@Module({
    imports: [
        HttpModule,
        GlobalCacheModule,
    ],
    controllers: [StewardController],
    providers: [
        StewardService,
        AgentCaller,
    ],
})
export class StewardModule {}
