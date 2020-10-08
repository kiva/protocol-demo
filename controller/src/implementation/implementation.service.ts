import { Injectable, Inject } from '@nestjs/common';
import { IDataService } from './data.service.interface';

@Injectable()
export class ImplementationService {

    public constructor(@Inject('IDataService') private readonly dataService: IDataService) {}

    public async fetchEntityData(entityId: string): Promise<any> {
        return await this.dataService.fetchEntityData(entityId);
    }

    public formatDataForCredential(data: any): any {
        return this.dataService.formatDataForCredential(data);
    }

    public formatDataForKeyGuardian(data: any) {
        return this.dataService.formatDataForKeyGuardian(data);
    }
 }
