import { Injectable, NotImplementedException } from '@nestjs/common';

/**
 * TODO I shouldn't need to define this if there's no data fetching part to the controller...
 */
@Injectable()
export class DataService {

    public async fetchEntityData(entityId: string): Promise<any> {
        throw new NotImplementedException();
    }

    public formatDataForCredential(data: any): any {
        throw new NotImplementedException();
    }

    public formatDataForKeyGuardian(data: any) {
        throw new NotImplementedException();
    }
}
