
export interface IDataService {

    fetchEntityData(entityId: string): Promise<any>;

    formatDataForCredential(data: any): any;

    formatDataForKeyGuardian(data: any);
}
