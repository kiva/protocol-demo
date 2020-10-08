import { Injectable, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {readFileSync} from 'fs';
import { json } from 'body-parser';
import { ProtocolExceptionFilter } from 'protocol-common/protocol.exception.filter';
import { Logger } from 'protocol-common/logger';
import { LoggingInterceptor } from 'protocol-common/logging.interceptor';
import { DatadogLogger } from 'protocol-common/datadog.logger';
import { traceware } from 'protocol-common/tracer';
import { Constants } from 'protocol-common/constants';
import { HttpConstants } from 'protocol-common/http-context/http.constants';
import { AgentService } from '../agent/agent.service';
import { exists } from 'fs';

/**
 * Sets up the app to support all the public gateway-like controllers, eg ratelimiting, etc
 */
@Injectable()
export class AppService {

    /**
     * Sets up app in a way that can be used by main.ts and e2e tests
     */
    public static async setup(app: INestApplication) {

        // Setting request-id middleware which assigns a unique requestid per incomming requests if not sent by client.
        const requestId = require('express-request-id')();
        app.use(requestId);

        const logger = new Logger(DatadogLogger.getLogger());
        app.useLogger(logger);

        // Increase json parse size to handle encoded images
        app.use(json({ limit: HttpConstants.JSON_LIMIT }));

        app.use(helmet());

        const corsWhitelist = process.env.CORS_WHITELIST;
        if (corsWhitelist) {
            app.enableCors({origin: corsWhitelist.split(',')});
        } else {
            app.enableCors();
        }
        app.useGlobalFilters(new ProtocolExceptionFilter());
        app.useGlobalInterceptors(new LoggingInterceptor());

        app.use(traceware('controllers'));

        // Default is 100 requests per minute
        app.use(rateLimit({
            windowMs: process.env.RATE_LIMIT_WINDOW_MS,
            max: process.env.RATE_LIMIT_MAX,
        }));

        // Load swagger docs and display
        if (process.env.NODE_ENV === Constants.LOCAL) {
            // Set up internal documentation at /api
            const options = new DocumentBuilder()
                .setTitle('Controllers')
                .setDescription('Internal Documentation for the Steward/Issuer/Verifier Controllers')
                .setVersion('1.0')
                .build();
            const document = SwaggerModule.createDocument(app, options);
            SwaggerModule.setup('api-docs', app, document);
        }

        await AppService.loadProfile();
    }

    /**
     * Find a give profile JSON and load values into env vars
     * @tothink there are a few different ways we could handle these profiles: files, loaded in code directly, database, etc
     */
    public static loadProfile() {
        const fullPath = __dirname + '/' + process.env.PROFILE_PATH;
        const profileString = readFileSync(fullPath).toString();
        if (!profileString) {
            throw new Error('Failed to load profile');
        }
        const profileJson = JSON.parse(profileString);
        const profile = {...profileJson.DEFAULT, ...profileJson[process.env.NODE_ENV]};

        for (const key of Object.keys(profile)) {
            process.env[key.toUpperCase()] = profile[key];
        }
    }

    /**
     * Try twice to spin up the agent, if it fails, quit
     */
    public static async initAgent(app: INestApplication) {
        const agentService = app.get<AgentService>(AgentService);
        try {
            await agentService.init();
        } catch (e) {
            Logger.log(`Failed to start agent, retrying... ${e.message}`, e);
            try {
                await agentService.init();
            } catch (e2) {
                Logger.log(`Failed to start agent, exiting... ${e2.message}`, e2);
                if (process.env.NODE_ENV !== Constants.LOCAL) {
                    // For non-local envs we want k8s to restart, locally we leave it up so we can investigate
                    process.exit(1);
                }
            }
        }
    }
}
