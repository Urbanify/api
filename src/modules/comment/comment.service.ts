import { CommentRepository } from '@infra/database/prisma/repositories/comment/comment.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserType } from '@shared/decorators/active-user.decorator';
import { UUIDGenerator } from '@shared/uuid-generator';

import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  public async create(createCommentDto: CreateCommentDto, userType: UserType) {
    const now = new Date();

    await this.commentRepository.create({
      id: UUIDGenerator.generate(),
      text: createCommentDto.text,
      issueId: createCommentDto.issueId,
      cityId: createCommentDto.cityId,
      authorId: userType.id,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async reply(
    parentId: string,
    createCommentDto: CreateCommentDto,
    userType: UserType,
  ) {
    const now = new Date();

    await this.commentRepository.create({
      id: UUIDGenerator.generate(),
      text: createCommentDto.text,
      issueId: createCommentDto.issueId,
      cityId: createCommentDto.cityId,
      authorId: userType.id,
      parentId: parentId,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async delete(id: string, userType: UserType) {
    const comment = await this.commentRepository.findById(id, userType);

    if (!comment) {
      throw new NotFoundException(`comment ${id} not found`);
    }

    await this.commentRepository.delete(id, userType);
  }
}
