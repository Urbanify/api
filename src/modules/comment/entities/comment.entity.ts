export class Comment {
  id: string;
  text: string;
  issueId: string;
  cityId: string;
  authorId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
