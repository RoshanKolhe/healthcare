import {
  Filter,
  FilterExcludingWhere,
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
} from '@loopback/rest';
import {ReportSummary} from '../models';
import {ReportSummaryRepository} from '../repositories';
import axios from 'axios';

export class ReportSummaryController {
  constructor(
    @repository(ReportSummaryRepository)
    public reportSummaryRepository: ReportSummaryRepository,
  ) {}

  @post('/report-summaries')
  @response(200, {
    description: 'ReportSummary model instance',
    content: {'application/json': {schema: getModelSchemaRef(ReportSummary)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ReportSummary, {
            title: 'NewReportSummary',
            exclude: ['id'],
          }),
        },
      },
    })
    reportSummary: Omit<ReportSummary, 'id'>,
  ): Promise<ReportSummary> {
    return this.reportSummaryRepository.create(reportSummary);
  }

  @get('/report-summaries')
  @response(200, {
    description: 'Array of ReportSummary model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ReportSummary, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ReportSummary) filter?: Filter<ReportSummary>,
  ): Promise<ReportSummary[]> {
    return this.reportSummaryRepository.find(filter);
  }

  @get('/report-summaries/{id}')
  @response(200, {
    description: 'ReportSummary model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ReportSummary, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ReportSummary, {exclude: 'where'})
    filter?: FilterExcludingWhere<ReportSummary>,
  ): Promise<ReportSummary> {
    return this.reportSummaryRepository.findById(id, filter);
  }

  @patch('/report-summaries/{id}')
  @response(204, {
    description: 'ReportSummary PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ReportSummary, {partial: true}),
        },
      },
    })
    reportSummary: ReportSummary,
  ): Promise<void> {
    await this.reportSummaryRepository.updateById(id, reportSummary);

    const updatedSummary: any = await this.reportSummaryRepository.findById(
      id,
      {
        include: [
          {
            relation: 'patientBooking',
            scope: {
              include: [
                {
                  relation: 'patient',
                },
              ],
            },
          },
        ],
      },
    );

    const WEBHOOK_SUMMARY_URL = process.env.WEBHOOK_URL;

    try {
      let message = '';

      if (updatedSummary.status === 1) {
        message = 'Your summary is approved';
      } else if (updatedSummary.status === 2) {
        message = `Your summary is rejected. Feedback: ${updatedSummary.feedback || 'No feedback provided'}`;
      } else {
        message = 'Your summary is under review';
      }

      const payload = {
        summaryId: updatedSummary.id,
        status: updatedSummary.status,
        summary: updatedSummary.summary,
        feedback: updatedSummary.feedback,
        fileUrl: updatedSummary.file,
        patientPhoneNo: updatedSummary.patientBooking?.patient?.phoneNo,
        message,
      };

      await axios.post(`${WEBHOOK_SUMMARY_URL}/summary_flag`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Webhook send failed:', error.message);
    }
  }

  @del('/report-summaries/{id}')
  @response(204, {
    description: 'ReportSummary DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.reportSummaryRepository.deleteById(id);
  }
}
