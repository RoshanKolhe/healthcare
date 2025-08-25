/* eslint-disable @typescript-eslint/naming-convention */
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
  getJsonSchemaRef,
  HttpErrors,
} from '@loopback/rest';
import {Branch, Doctor} from '../models';
import {
  BranchDoctorRepository,
  Credentials,
  DoctorRepository,
} from '../repositories';
import {HealthcareDataSource} from '../datasources';
import {EmailManagerBindings} from '../keys';
import {EmailManager} from '../services/email.service';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {MyDoctorService} from '../services/doctor-service';
import {JWTService} from '../services/jwt-service';
import {validateCredentials} from '../services/validator';
import SITE_SETTINGS from '../utils/config';
import _ from 'lodash';
import {CredentialsRequestBody} from './specs/user-controller-spec';
import {UserProfile} from '@loopback/security';
import {PermissionKeys} from '../authorization/permission-keys';
import generateResetPasswordTemplate from '../templates/reset-password.template';

export class DoctorController {
  constructor(
    @inject('datasources.healthcare')
    public dataSource: HealthcareDataSource,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
    @repository(BranchDoctorRepository)
    public branchDoctorRepository: BranchDoctorRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.doctor.service')
    public userService: MyDoctorService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) {}

  @post('/doctors-register', {
    responses: {
      '200': {
        description: 'Doctor',
        content: {
          schema: getJsonSchemaRef(Doctor),
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ...getModelSchemaRef(Doctor, {exclude: ['id']}).definitions
                ?.Doctor?.properties,
              branches: {
                type: 'array',
                items: {type: 'number'}, // Branch IDs
              },
            },
          },
        },
      },
    })
    doctorData: Omit<Doctor, 'id'> & {
      branches?: number[];
    },
  ) {
    const repo = new DefaultTransactionalRepository(Doctor, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const {branches, ...doctorFields} = doctorData;
      validateCredentials(doctorFields);

      const doctor = await this.doctorRepository.findOne({
        where: {email: doctorData.email},
      });
      if (doctor) {
        throw new HttpErrors.BadRequest('Doctor Already Exists');
      }

      // Hash password
      doctorData.password = await this.hasher.hashPassword(doctorData.password);

      // Create doctor
      const savedDoctor = await this.doctorRepository.create(doctorFields, {
        transaction: tx,
      });

      // Link branches if provided
      if (branches?.length) {
        for (const branchId of branches) {
          await this.doctorRepository.branches(savedDoctor.id).link(branchId);
        }
      }

      const savedDoctorData = _.omit(savedDoctor, 'password');
      await tx.commit();

      return {
        success: true,
        doctorData: savedDoctorData,
        message: `Doctor registered successfully`,
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @post('/doctors-login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{}> {
    const doctor = await this.userService.verifyCredentials(credentials);
    const doctorProfile = this.userService.convertToUserProfile(doctor);
    const doctorData = _.omit(doctor, 'password');
    const token = await this.jwtService.generateToken(doctorProfile);
    const allDoctorData = await this.doctorRepository.findById(doctorData.id);
    return Promise.resolve({
      accessToken: token,
      doctor: allDoctorData,
    });
  }

  @get('/doctors/me')
  @authenticate('jwt')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currnetDoctor: UserProfile,
  ): Promise<{}> {
    console.log(currnetDoctor);
    const doctor = await this.doctorRepository.findOne({
      where: {
        id: currnetDoctor.id,
      },
      include: [{relation: 'clinic'}],
    });
    const doctorData = _.omit(doctor, 'password');
    return Promise.resolve({
      ...doctorData,
      displayName: `${doctorData?.firstName} ${doctorData?.lastName}`,
    });
  }

  @get('/doctors/list')
  @response(200, {
    description: 'Array of Doctors model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Doctor, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(@param.filter(Doctor) filter?: Filter<Doctor>): Promise<Doctor[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      fields: {password: false, otp: false, otpExpireAt: false},
      include: [
        {relation: 'clinic'},
        {relation: 'branches'},
        {relation: 'specialization'},
      ],
    };
    return this.doctorRepository.find(filter);
  }

  @get('/doctors/{id}', {
    responses: {
      '200': {
        description: 'Doctor Details',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Doctor),
          },
        },
      },
    },
  })
  async getSingleDoctor(@param.path.number('id') id: number): Promise<any> {
    const doctor = await this.doctorRepository.findOne({
      where: {
        id: id,
      },
      fields: {
        password: false,
        otp: false,
        otpExpireAt: false,
      },
      include: [
        {relation: 'clinic'},
        {relation: 'branches'},
        {relation: 'specialization'},
      ],
    });
    return Promise.resolve({
      ...doctor,
    });
  }
  @patch('/doctors/{id}')
  @response(204, {
    description: 'Doctor PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ...getModelSchemaRef(Doctor, {partial: true}).definitions?.Doctor
                ?.properties,
              branches: {
                type: 'array',
                items: {type: 'number'}, // Branch IDs
              },
            },
          },
        },
      },
    })
    doctorData: Partial<Doctor> & {branches?: number[]},
    @inject(AuthenticationBindings.CURRENT_USER) currentDoctor: UserProfile,
  ): Promise<any> {
    const existingDoctor = await this.doctorRepository.findById(id);
    if (!existingDoctor) {
      throw new HttpErrors.NotFound('Doctor not found');
    }

    // Hash password if updated
    if (doctorData.password) {
      doctorData.password = await this.hasher.hashPassword(doctorData.password);
    }

    // Validate email uniqueness
    if (doctorData.email && doctorData.email !== existingDoctor.email) {
      const emailExists = await this.doctorRepository.findOne({
        where: {email: doctorData.email, id: {neq: id}},
      });
      if (emailExists) {
        throw new HttpErrors.BadRequest('Email already exists');
      }
    }

    // Extract branches separately
    const {branches, ...doctorFields} = doctorData;

    // Update doctor fields
    await this.doctorRepository.updateById(id, doctorFields);

    // Update branch links if provided
    if (branches) {
      // First unlink all existing branches
      const existingBranches = await this.doctorRepository.branches(id).find();
      for (const branch of existingBranches) {
        await this.doctorRepository.branches(id).unlink(branch.id);
      }

      // Then link the new branches
      for (const branchId of branches) {
        await this.doctorRepository.branches(id).link(branchId);
      }
    }

    return {
      success: true,
      message: `Doctor profile updated successfully`,
    };
  }

  @post('/doctors/sendResetPasswordLink')
  async sendResetPasswordLink(
    @requestBody({
      description: 'Input for sending reset password link',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'The email address of the doctor',
              },
            },
            required: ['email'],
          },
        },
      },
    })
    doctorData: {
      email: string;
    },
  ): Promise<object> {
    const doctor = await this.doctorRepository.findOne({
      where: {
        email: doctorData.email,
      },
    });
    if (doctor) {
      const doctorProfile = this.userService.convertToUserProfile(doctor);
      const token = await this.jwtService.generate10MinToken(doctorProfile);
      const resetPasswordLink = `${process.env.REACT_APP_ENDPOINT}/auth/admin/new-password?token=${token}`;
      const template = generateResetPasswordTemplate({
        doctorData: doctorProfile,
        resetLink: resetPasswordLink,
      });
      console.log(template);
      const mailOptions = {
        from: SITE_SETTINGS.fromMail,
        to: doctorData.email,
        subject: template.subject,
        html: template.html,
      };

      try {
        await this.emailManager.sendMail(mailOptions);
        return {
          success: true,
          message: `Password reset link sent to ${doctorData.email}. Please check your inbox.`,
        };
      } catch (err) {
        throw new HttpErrors.UnprocessableEntity(
          err.message || 'Mail sending failed',
        );
      }
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exist");
    }
  }

  @authenticate('jwt')
  @post('/doctors/setPassword')
  async setPassword(
    @requestBody({
      description: 'Input for changing doctor password',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              oldPassword: {
                type: 'string',
                description: "The doctor's current password",
              },
              newPassword: {
                type: 'string',
                description: 'The new password to be set',
              },
            },
            required: ['oldPassword', 'newPassword'],
          },
        },
      },
    })
    passwordOptions: any,
    @inject(AuthenticationBindings.CURRENT_USER) currentDoctor: UserProfile,
  ): Promise<object> {
    const doctor = await this.doctorRepository.findOne({
      where: {
        id: currentDoctor.id,
      },
    });

    if (doctor) {
      const passwordCheck = await this.hasher.comparePassword(
        passwordOptions.oldPassword,
        doctor.password,
      );

      if (passwordCheck) {
        const encryptedPassword = await this.hasher.hashPassword(
          passwordOptions.newPassword,
        );
        await this.doctorRepository.updateById(doctor.id, {
          password: encryptedPassword,
        });
        return {
          success: true,
          message: 'Password changed successfully',
        };
      } else {
        throw new HttpErrors.BadRequest("Old password doesn't match");
      }
    } else {
      throw new HttpErrors.BadRequest("Email doesn't exist");
    }
  }

  @authenticate('jwt')
  @post('/doctors/setNewPassword')
  async setNewPassword(
    @requestBody({
      description:
        'Input for resetting doctor password without the old password',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'The email address of the doctor',
              },
              newPassword: {
                type: 'string',
                description: 'The new password to be set',
              },
            },
            required: ['email', 'newPassword'], // Only email and newPassword are required
          },
        },
      },
    })
    passwordOptions: any,
  ): Promise<object> {
    const doctor = await this.doctorRepository.findOne({
      where: {
        email: passwordOptions.email,
      },
    });

    if (doctor) {
      const encryptedPassword = await this.hasher.hashPassword(
        passwordOptions.newPassword,
      );
      await this.doctorRepository.updateById(doctor.id, {
        password: encryptedPassword,
      });
      return {
        success: true,
        message: 'Password updated successfully',
      };
    } else {
      throw new HttpErrors.BadRequest("Email doesn't exist");
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/doctors/{id}')
  @response(204, {
    description: 'Doctor DELETE success',
  })
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER) currentDoctor: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<void> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new HttpErrors.BadRequest('Doctor Not Found');
    }

    await this.doctorRepository.updateById(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  @get('/doctors/{id}/branches', {
    responses: {
      '200': {
        description: 'Doctor has many Branches',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Branch),
            },
          },
        },
      },
    },
  })
  async findDoctorBranches(
    @param.path.number('id') id: typeof Doctor.prototype.id,
    @param.query.object('filter') filter?: Filter<Branch>,
  ): Promise<Branch[]> {
    return this.doctorRepository.branches(id).find(filter);
  }
}
