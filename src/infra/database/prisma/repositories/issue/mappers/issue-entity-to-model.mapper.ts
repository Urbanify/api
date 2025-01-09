import { Issue } from '@modules/issue/entities/issue.entity';
import { UUIDGenerator } from '@shared/uuid-generator';

export class IssueEntityToModelMapper {
  public static map({
    id,
    status,
    cityId,
    latitude,
    longitude,
    category,
    description,
    reporterId,
    fiscalId,
    managerId,
    createdAt,
    updatedAt,
    history,
    photos,
  }: Issue) {
    return {
      id,
      status,
      cityId,
      latitude,
      longitude,
      category,
      description,
      reporterId,
      fiscalId,
      managerId,
      createdAt,
      updatedAt,
      history:
        history.map((history) => ({
          id: history.id,
          userId: history.userId,
          action: history.action,
          description: history.description,
          createdAt: history.createdAt,
          updatedAt: history.updatedAt,
        })) || [],
      photos:
        photos?.map((photo) => ({
          id: UUIDGenerator.generate(),
          url: photo,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) || [],
    };
  }
}
