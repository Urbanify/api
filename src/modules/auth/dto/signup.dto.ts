import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { UserRole } from "../entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  surname: string;
  
  @IsEmail()
  @ApiProperty()
  email: string;
  
  @IsString()
  @ApiProperty()
  password: string;
  
  @IsString()
  @ApiProperty()
  cpf: string;
  
  @IsString()
  @IsOptional()
  @ApiProperty()
  cityId?: string;
  
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
