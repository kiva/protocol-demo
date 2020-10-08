import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { MobileModule } from './mobile/mobile.module';

/**
 * TODO I shouldn't actually need to specific a module is there is no custom code
 */
@Module({
    imports: [
        MobileModule,
    ],
    providers: [
        {
            provide: 'IDataService',
            useClass: DataService
        },
    ],
    exports: [
        'IDataService',
        MobileModule,
    ]
})
export class DemoModule {}
