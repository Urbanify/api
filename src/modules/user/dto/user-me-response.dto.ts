import { ApiProperty } from '@nestjs/swagger';

export class UserMeResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  cpf: string | null;

  @ApiProperty()
  fiscalOfIssuesCount: number;

  @ApiProperty()
  createdIssuesCount: number;

  @ApiProperty()
  createdAt: Date;
}
