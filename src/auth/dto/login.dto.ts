import { Allow, IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @Allow()
    @IsEmail()
    email: string;

    @Allow()
    @IsString()
    @MinLength(1)
    password: string;
}
