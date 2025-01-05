export class City {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  status: boolean;
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
