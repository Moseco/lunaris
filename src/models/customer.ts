import { ValidateIf, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

export default class Customer {
    // Can be null if phone is given
    @ValidateIf(o => o.email || !o.phone)
    @IsNotEmpty()
    @IsEmail()
    email?: string;

    // Can be null if email is given
    @ValidateIf(o => o.phone || !o.email)
    @IsNotEmpty()
    @IsPhoneNumber()
    phone?: string;

    constructor(source: any) {
        this.email = source.email;
        this.phone = source.phone;
    }
}