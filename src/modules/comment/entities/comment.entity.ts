import { UserRole } from '@modules/auth/entities/user.entity';

export class Comment {
  id: string;
  text: string;
  issueId: string;
  cityId: string;
  authorId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    cityId?: string;
    role: UserRole;
  };
}
