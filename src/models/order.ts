import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import Customer from './customer';

export default class Order {
    @IsString()
    @IsNotEmpty()
    id!: string;

    @IsNumber()
    @IsNotEmpty()
    amountPaid!: number;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @ValidateNested()
    @IsNotEmpty()
    customer!: Customer;

    constructor(source: any) {
        this.id = source.order.id;
        this.amountPaid = source.order.paid;
        this.currency = source.order.currency;
        this.customer = new Customer(source.customer);
    }
}