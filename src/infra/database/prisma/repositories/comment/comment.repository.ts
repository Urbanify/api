import { Comment } from '@modules/comment/entities/comment.entity';
import { Injectable } from '@nestjs/common';
import { UserType } from '@shared/decorators/active-user.decorator';

import { CommentEntityToModelMapper } from './mappers/comment-entity-to-model.mapper';
import { CommentModelToEntityMapper } from './mappers/comment-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';

type ListCommentsQueryFilter = {
  issueId: string;
  cityId: string;
  page: number;
  take?: number;
};

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
      include: {
        author: true,
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

  public async list(queryFilter: ListCommentsQueryFilter): Promise<{
    items: Comment[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    take: number;
  }> {
    const page = queryFilter.page;
    const take = queryFilter.take || 10;
    const skip = (page - 1) * take;

    const commentsModel = await this.prismaService.comment.findMany({
      where: {
        issueId: queryFilter.issueId,
        cityId: queryFilter.cityId,
      },
      include: {
        author: true,
      },
      take: take + 1,
      skip,
      orderBy: {
        createdAt: 'asc',
      },
    });

    const hasNextPage = commentsModel.length > take;
    const hasPreviousPage = page > 1;

    if (hasNextPage) {
      commentsModel.pop();
    }

    const comments = commentsModel.map((commentModel) =>
      CommentModelToEntityMapper.map(commentModel),
    );

    return {
      hasNextPage,
      hasPreviousPage,
      take,
      items: comments,
      currentPage: page,
    };
  }
}
