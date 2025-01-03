import { Injectable } from "@nestjs/common"
import { User, UserRole } from "src/modules/auth/entities/user.entity"
import { PrismaService } from "../../prisma.service"
import { UserEntityToModelMapper } from "./mappers/user-entity-to-model.mapper"
import { UserModelToEntityMapper } from "./mappers/user-model-to-entity.mapper"

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  public async create(user: User): Promise<User> {
    const data = UserEntityToModelMapper.map(user)

    const userModel = await this.prismaService.user.create(data)

    return UserModelToEntityMapper.map(userModel)
  }

  public async findByCpf(cpf: string): Promise<User | null> {
    const userModel = await this.prismaService.user.findUnique({
      where: {
        cpf
      }
    })

    if (!userModel) {
      return null
    }

    return UserModelToEntityMapper.map(userModel)
  }

  public async findByEmail(email: string): Promise<User | null> {
    const userModel = await this.prismaService.user.findUnique({
      where: {
        email
      }
    })

    if (!userModel) {
      return null
    }

    return UserModelToEntityMapper.map(userModel)
  }
}