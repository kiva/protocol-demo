import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { MobileModule } from './mobile/mobile.module';
import { KycModule } from './kyc/kyc.module';

/**
 * TODO I shouldn't actually need to specific a module is there is no custom code
 */
@Module({
    imports: [
        MobileModule,
        KycModule,
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
        KycModule
    ]
})
export class DemoModule {}
