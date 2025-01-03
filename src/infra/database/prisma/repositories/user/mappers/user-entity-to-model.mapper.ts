import { Prisma } from "@prisma/client"
import { User } from "src/modules/auth/entities/user.entity"

export class UserEntityToModelMapper {
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
  }: User): Prisma.UserCreateArgs {
    const args: Prisma.UserCreateArgs = {
      data: {
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
      }
    }

    return args
  }
}