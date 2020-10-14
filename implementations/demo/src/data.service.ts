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
        const mapping = {
            'nationalId': data.nationalId,
            'firstName': data.firstName,
            'lastName': data.lastName,
            'birthDate': data.birthDate,
        };
        // And then map to the way Aries wants it
        const attributes = [];
        for (const key of Object.keys(mapping)) {
            attributes.push({
                name: key,
                value: mapping[key],
            });
        }

        // Special handling for images
        // @tothink historically we expected hex images and manually did the conversion to base64 here - we could just have the client pass 
        // Note we use mime-type text/plain because Aries .NET doesn't support image/png
        attributes.push({
            name: 'photo~attach',
            value: Buffer.from(data.faceImage, 'hex').toString('base64'),
            'mime-type': 'text/plain'
        });
        return attributes;
    }

    /**
     * Only supporting fingerprint service for now
     */
    public formatDataForKeyGuardian(data: any) {
        const filters = {
            govId1: data.nationalId,
            govId2: data.nationalId
        };
        const params = [];
        for (const fingerprint of data.fingerprints) {
            params.push({
                national_id: data.nationalId,
                voter_id: data.nationalId,
                type_id: 1,
                position: fingerprint.position,
                missing_code: null,
                capture_date: null,
                image: fingerprint.image,
            });
        }
        return {
            pluginType: 'FINGERPRINT',
            filters,
            params,
        };
    }
}
