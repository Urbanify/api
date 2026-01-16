import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/modules/auth/entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty({ required: false })
  cityId?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
