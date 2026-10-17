import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import { User, UserRole } from '@modules/auth/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserType } from '@shared/decorators/active-user.decorator';

import { UserService } from './user.service';

describe('UserService', () => {
  const repository = {
    deleteById: jest.fn(),
    findById: jest.fn(),
    findMe: jest.fn(),
    update: jest.fn(),
  };
  let service: UserService;

  const staff = (role: UserRole): UserType => ({
    id: 'staff-id',
    name: 'Staff',
    surname: 'User',
    role,
    cityId: 'city-id',
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(UserService);
  });

  it('deletes the account of the user', async () => {
    await service.deleteMe('user-id');

    expect(repository.deleteById).toHaveBeenCalledWith('user-id');
  });

  it('returns the profile of the user', async () => {
    repository.findMe.mockResolvedValue({ name: 'Ana' });

    await expect(service.getMe('user-id')).resolves.toEqual({ name: 'Ana' });
  });

  it('rejects the profile of an unknown user', async () => {
    repository.findMe.mockResolvedValue(null);

    await expect(service.getMe('user-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lets an admin change a role', async () => {
    const user = { id: 'user-id', role: UserRole.RESIDENT } as User;
    repository.findById.mockResolvedValue(user);

    await service.changeRole(
      'user-id',
      UserRole.MANAGER,
      staff(UserRole.ADMIN),
    );

    expect(repository.update).toHaveBeenCalledWith({
      ...user,
      role: UserRole.MANAGER,
    });
  });

  it('does not let a manager promote someone to owner', async () => {
    repository.findById.mockResolvedValue({
      id: 'user-id',
      role: UserRole.RESIDENT,
    } as User);

    await expect(
      service.changeRole('user-id', UserRole.OWNER, staff(UserRole.MANAGER)),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not let a non admin touch an admin', async () => {
    repository.findById.mockResolvedValue({
      id: 'user-id',
      role: UserRole.ADMIN,
    } as User);

    await expect(
      service.changeRole('user-id', UserRole.RESIDENT, staff(UserRole.OWNER)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a role change for an unknown user', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.changeRole('user-id', UserRole.RESIDENT, staff(UserRole.ADMIN)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
