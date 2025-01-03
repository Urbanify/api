export enum UserRole {
  RESIDENT = 'RESIDENT',
  MANAGER = 'MANAGER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  FINANCIAL = 'FINANCIAL',
}

export class User {
  id: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  cpf: string;
  cityId?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
