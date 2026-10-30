import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ContactDto {
    @Transform(trim)
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @Transform(trim)
    @IsEmail()
    @MaxLength(254)
    email: string;

    @Transform(trim)
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    message: string;
}
