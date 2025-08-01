import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Doctor} from '../models';
import {Credentials, UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password.bcrypt';
import { DoctorRepository } from '../repositories';

export class MyDoctorService implements UserService<Doctor, Credentials> {
  constructor(
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Doctor> {
    const getDoctor = await this.doctorRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!getDoctor) {
      throw new HttpErrors.BadRequest('Doctor not found');
    }

    if (!getDoctor.password) {
      throw new HttpErrors.BadRequest(
        'No Password is assigned to this mail please reset the password',
      );
    }

    if (!getDoctor.isActive) {
      throw new HttpErrors.BadRequest('Doctor not active');
    }

    const passswordCheck = await this.hasher.comparePassword(
      credentials.password,
      getDoctor.password,
    );
    if (passswordCheck) {
      return getDoctor;
    }
    throw new HttpErrors.BadRequest('password doesnt match');
  }

  convertToUserProfile(doctor: Doctor): UserProfile {
    return {
      id: `${doctor.id}`,
      name: `${doctor.firstName}`,
      email: doctor.email,
      [securityId]: `${doctor.id}`,
      permissions: doctor.permissions,
      doctorType: 'admin',
    };
  }
}
