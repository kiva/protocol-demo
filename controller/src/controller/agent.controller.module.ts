import { Module, HttpModule } from '@nestjs/common';
import { AgentControllerService } from './agent.controller.service';
import { AgentControllerController } from './agent.controller.controller';
import { GlobalCacheModule } from '../app/global.cache.module';

/**
 * The controller module for our agency, handles all the callbacks and webhooks from our agents
 */
@Module({
    imports: [
        HttpModule,
        GlobalCacheModule,
    ],
    controllers: [AgentControllerController],
    providers: [AgentControllerService],
})
export class AgentControllerModule {}
