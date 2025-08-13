import {Entity, model, property} from '@loopback/repository';

@model()
export class BranchDoctor extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  doctorId?: number;

  @property({
    type: 'number',
  })
  branchId?: number;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'date',
  })
  deletedAt?: Date;

  constructor(data?: Partial<BranchDoctor>) {
    super(data);
  }
}

export interface BranchDoctorRelations {
  // describe navigational properties here
}

export type BranchDoctorWithRelations = BranchDoctor & BranchDoctorRelations;
