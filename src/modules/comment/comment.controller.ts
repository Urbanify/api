import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';
import { AuthValidationInterceptor } from '@shared/interceptors/auth.interceptor';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@UseInterceptors(AuthValidationInterceptor)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a comment' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.commentService.create(createCommentDto, userType);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply a comment' })
  replyComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.commentService.reply(id, createCommentDto, userType);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  remove(@Param('id') parentId: string, @ActiveUser() userType: UserType) {
    return this.commentService.delete(parentId, userType);
  }
}
