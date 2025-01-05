export enum CityStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED',
}

export class City {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  status: CityStatus;
  createdAt: Date;
  updatedAt: Date;
  featureFlags: {
    cityId: string;
    featureFlagId: string;
    slug: string;
    description: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
