import { User } from 'src/modules/auth/entities/user.entity';

export class UserModelToEntityMapper {
  public static map({
    id,
    name,
    surname,
    email,
    password,
    cpf,
    cityId,
    role,
    createdAt,
    updatedAt,
  }): User {
    return {
      id,
      name,
      surname,
      email,
      password,
      cpf,
      cityId,
      role,
      createdAt,
      updatedAt,
    };
  }
}
