import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export default class PointsModifier {
    @IsNumber()
    @IsNotEmpty()
    modifier!: number;

    @IsDateString()
    @IsOptional()
    validUntil?: string;

    constructor(source: any) {
        this.modifier = source.modifier;
        this.validUntil = source.valid_until;
    }
}