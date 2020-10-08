import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { Logger } from 'protocol-common/logger';
import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';

let app: INestApplication;
async function bootstrap() {
    const port = process.env.PORT;
    // Need to disable body parser for http-proxy to work for POSTs: https://github.com/nestjs/nest/issues/405
    app = await NestFactory.create(AppModule, {
        bodyParser: false,
    });

    await AppService.setup(app);
    await app.listen(port);
    Logger.info(`Server started on ${port}`);
    await AppService.initAgent(app);
}
bootstrap();
export { app };
