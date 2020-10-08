import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppService } from '../src/app/app.service';
import { AppController } from '../src/app/app.controller';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
        providers: [AppService],
        controllers: [AppController],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer())
        .get('/')
        .expect(200);
    });

    it('/ping (GET)', () => {
        return request(app.getHttpServer())
        .get('/ping')
        .expect(200)
        .expect('pong');
    });

    it('/healthz (GET)', () => {
        return request(app.getHttpServer())
        .get('/healthz')
        .expect(200);
    });
});
