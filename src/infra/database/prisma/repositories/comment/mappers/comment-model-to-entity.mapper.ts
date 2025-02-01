import { Comment } from 'src/modules/comment/entities/comment.entity';

export class CommentModelToEntityMapper {
  public static map({
    id,
    text,
    issueId,
    cityId,
    authorId,
    parentId,
    createdAt,
    updatedAt,
  }): Comment {
    return {
      id,
      text,
      issueId,
      cityId,
      authorId,
      parentId,
      createdAt,
      updatedAt,
    };
  }
}
