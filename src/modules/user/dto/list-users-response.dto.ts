import { ApiProperty } from '@nestjs/swagger';
import { Paginated } from 'src/modules/auth/entities/user.entity';

import { UserResponseDto } from './user-response.dto';

export class ListUsersResponseDto implements Paginated<UserResponseDto> {
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  take: number;
}
