import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for a issue request
 */
export class IssueDto {

    @ApiProperty({ minLength: 1, maxLength: 50 })
    @IsString() @Length(1, 50) readonly nationalId: string; // Max 50 chars

    @ApiProperty({ minLength: 1, maxLength: 50 })
    @IsString() @Length(1, 50) readonly firstName: string; // Max 50 chars

    @ApiProperty({ minLength: 1, maxLength: 50 })
    @IsString() @Length(1, 50) readonly lastName: string; // Max 50 chars

    @ApiProperty()
    @IsString() readonly birthDate: string; // String in date format

    @ApiProperty()
    @IsString() readonly faceImage: string; // Hex image

    @ApiProperty()
    @IsOptional() @IsString() readonly connectionId: string; // Connection id for a mobile agent connection
}