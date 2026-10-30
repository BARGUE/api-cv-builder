import { IsString, IsOptional, MinLength, IsInt, Min, IsBoolean, IsArray } from 'class-validator';

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

    @IsArray()
    @IsOptional()
    experiences?: unknown;

    @IsArray()
    @IsOptional()
    education?: unknown;

    @IsArray()
    @IsOptional()
    skills?: unknown;

    @IsArray()
    @IsOptional()
    languages?: unknown;

    @IsInt()
    @Min(1)
    @IsOptional()
    currentStep?: number;

    @IsBoolean()
    @IsOptional()
    completed?: boolean;
}
