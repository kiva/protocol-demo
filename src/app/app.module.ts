import { Module } from '@nestjs/common';
import { AppService } from 'aries-controller/app/app.service';
import { AppController } from 'aries-controller/app/app.controller';
import { AgentModule } from 'aries-controller/agent/agent.module';
import { ConfigModule } from 'protocol-common/config.module';
import { AgentControllerModule } from 'aries-controller/controller/agent.controller.module';
import { IssuerModule } from 'aries-controller/issuer/issuer.module';
import { StewardModule } from 'aries-controller/steward/steward.module';
import { VerifierModule } from 'aries-controller/verifier/verifier.module';
import { ApiModule } from 'aries-controller/api/api.module';
import data from 'aries-controller/config/env.json';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from 'protocol-common/logging.interceptor';

/**
 * Pull the various modules from aries-controller, and adds in the modules specific for this controller (mobile)
 */
@Module({
    imports: [
        ConfigModule.init(data),
        AgentModule,
        AgentControllerModule,
        IssuerModule,
        StewardModule,
        VerifierModule,
        ApiModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor
        }
    ],
    exports: []
})
export class AppModule {}
