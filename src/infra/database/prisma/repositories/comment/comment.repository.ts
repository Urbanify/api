import { Comment } from '@modules/comment/entities/comment.entity';
import { Injectable } from '@nestjs/common';
import { UserType } from '@shared/decorators/active-user.decorator';

import { CommentEntityToModelMapper } from './mappers/comment-entity-to-model.mapper';
import { CommentModelToEntityMapper } from './mappers/comment-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(comment: Comment): Promise<void> {
    const data = CommentEntityToModelMapper.map(comment);

    await this.prismaService.comment.create({
      data,
    });
  }

  public async findById(
    id: string,
    userType: UserType,
  ): Promise<Comment | null> {
    const commentModel = await this.prismaService.comment.findUnique({
      where: {
        id,
        authorId: userType.id,
      },
    });

    if (!commentModel) {
      return null;
    }

    return CommentModelToEntityMapper.map(commentModel);
  }

  public async delete(id: string, userType: UserType): Promise<void> {
    await this.prismaService.comment.delete({
      where: {
        id,
        authorId: userType.id,
      },
    });
  }
}
