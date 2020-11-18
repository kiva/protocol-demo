import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { Logger } from 'protocol-common/logger';
import { AppModule } from './app/app.module';
import { AppService } from 'aries-controller/app/app.service';

let app: INestApplication;
async function bootstrap() {
    const port = process.env.PORT;
    app = await NestFactory.create(AppModule);

    await AppService.setup(app);
    await app.listen(port);
    Logger.info(`Server started on ${port}`);
    await AppService.initAgent(app);
}
bootstrap();
export { app };
