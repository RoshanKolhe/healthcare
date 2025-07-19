import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Users} from '../models';
import {Credentials, UsersRepository} from './../repositories/users.repository';
import {BcryptHasher} from './hash.password.bcrypt';

export class MyUserService implements UserService<Users, Credentials> {
  constructor(
    @repository(UsersRepository)
    public userRepository: UsersRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Users> {
    const getUser = await this.userRepository.findOne({
      where: {
        or: [{email: credentials.email}],
      },
    });
    if (!getUser) {
      throw new HttpErrors.BadRequest('Invalid credentials');
    }

    if (!getUser.password) {
      throw new HttpErrors.BadRequest(
        'No Password is assigned to this mail please reset the password',
      );
    }

    if (!getUser.isActive) {
      throw new HttpErrors.BadRequest('User not active');
    }

    const passswordCheck = await this.hasher.comparePassword(
      credentials.password,
      getUser.password,
    );
    if (passswordCheck) {
      return getUser;
    }
    throw new HttpErrors.BadRequest('Invalid credentials');
  }

  convertToUserProfile(user: Users): UserProfile {
    return {
      id: `${user.id}`,
      name: `${user.firstName}`,
      email: user.email,
      [securityId]: `${user.id}`,
      permissions: user.permissions,
      userType: user.permissions.includes('admin') ? 'admin' : 'user',
    };
  }
}
