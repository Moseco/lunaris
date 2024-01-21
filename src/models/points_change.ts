import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import Customer from './customer';

export default class PointsChange {
    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @IsString()
    @IsOptional()
    reason?: string;

    @ValidateNested()
    @IsNotEmpty()
    customer!: Customer;

    constructor(source: any) {
        this.amount = source.amount;
        this.reason = source.reason;
        this.customer = new Customer(source.customer);
    }
}