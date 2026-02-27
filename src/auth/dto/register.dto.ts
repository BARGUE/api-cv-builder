import { Allow, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @Allow()
    @IsEmail()
    email: string;

    @Allow()
    @IsString()
    @MinLength(8)
    password: string;
}
