import { UserRole } from '@modules/auth/entities/user.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';

export class CommentModelToEntityMapper {
  public static map({
    id,
    text,
    issueId,
    cityId,
    authorId,
    author,
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
      author: author && {
        id: author.id,
        name: author.name,
        surname: author.surname,
        email: author.email,
        cityId: author.cityId,
        role: UserRole[author.role],
      },
    };
  }
}
