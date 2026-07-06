import { Allow, IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
    @Allow()
    @IsEmail()
    email: string;

    @Allow()
    @IsString()
    @MinLength(8)
    password: string;

    @Allow()
    @Transform(({ value, obj }) => (value != null ? String(value) : (obj.first_name != null ? String(obj.first_name) : '')))
    @IsString()
    firstName: string;

    @Allow()
    @Transform(({ value, obj }) => (value != null ? String(value) : (obj.last_name != null ? String(obj.last_name) : '')))
    @IsString()
    lastName: string;
}
