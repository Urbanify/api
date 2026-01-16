import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/modules/auth/entities/user.entity';

export class ListUsersQueryDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 10 })
  take?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @IsEnum(UserRole, { each: true })
  @ApiProperty({ required: false, enum: UserRole, isArray: true })
  roles?: UserRole[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Name, Email or CPF' })
  search?: string;
}
