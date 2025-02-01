import { CommentRepository } from '@infra/database/prisma/repositories/comment/comment.repository';
import { UserRole } from '@modules/auth/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '@shared/decorators/active-user.decorator';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: CommentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: CommentRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentRepository = module.get<CommentRepository>(CommentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createInput: CreateCommentDto = {
        text: 'comment',
        issueId: '7ee43ccb-8b2c-40f1-9999-706ea01dd95b',
        cityId: '40c77e49-8310-426c-a535-2660984eeb59',
      };

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      await service.create(createInput, user);

      expect(commentRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('reply', () => {
    it('should reply a comment', async () => {
      const parentId = 'e6e3b78d-103e-4501-b579-9f0829f06a2a';

      const createInput: CreateCommentDto = {
        text: 'comment',
        issueId: '7ee43ccb-8b2c-40f1-9999-706ea01dd95b',
        cityId: '40c77e49-8310-426c-a535-2660984eeb59',
      };

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      await service.reply(parentId, createInput, user);
      expect(commentRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a comment', async () => {
      const comment: Comment = {
        id: '4b9130e4-1c91-4bba-bbc8-0747df00334d',
        text: 'comment',
        issueId: '7ee43ccb-8b2c-40f1-9999-706ea01dd95b',
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        authorId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      jest.spyOn(commentRepository, 'findById').mockResolvedValueOnce(comment);

      await service.delete(comment.id, user);

      expect(commentRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when comment not found', async () => {
      const id = 'id';
      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const notFoundException = new NotFoundException(
        `comment ${id} not found`,
      );

      expect(service.delete(id, user)).rejects.toEqual(notFoundException);
    });
  });
});
