import { IsString, IsOptional, MinLength, IsNumber, IsBoolean } from 'class-validator';

export class CreateCvDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsString()
    @IsOptional()
    template?: string;

    @IsString()
    @IsOptional()
    accentColor?: string;

    @IsString()
    @IsOptional()
    photoUrl?: string | null;

    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    jobTitle?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    summary?: string;

    @IsOptional()
    experiences?: unknown;

    @IsOptional()
    education?: unknown;

    @IsOptional()
    skills?: unknown;

    @IsOptional()
    languages?: unknown;

    @IsNumber()
    @IsOptional()
    currentStep?: number;

    @IsBoolean()
    @IsOptional()
    completed?: boolean;
}
