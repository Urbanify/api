import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from 'src/modules/auth/entities/user.entity';

export class ChangeRoleDto {
  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
