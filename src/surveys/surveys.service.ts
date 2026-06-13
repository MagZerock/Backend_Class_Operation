import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const surveys = await this.prisma.survey.findMany({
      orderBy: { title: 'asc' },
    });
    return { message: 'Surveys retrieved successfully', data: surveys };
  }

  async findOne(surveyId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { surveyId },
      include: { responses: true },
    });
    if (!survey) throw new NotFoundException('Survey not found');
    return { message: 'Survey retrieved successfully', data: survey };
  }

  async submit(surveyId: string, dto: SubmitSurveyDto) {
    const survey = await this.prisma.survey.findUnique({ where: { surveyId } });
    if (!survey) throw new NotFoundException('Survey not found');

    if (!dto.responses || dto.responses.length === 0) {
      throw new BadRequestException('responses array is required and must not be empty');
    }

    const data = dto.responses.map((r) => ({
      surveyId,
      userId: dto.user_id ?? null,
      questionId: r.question_id,
      answer: r.answer,
    }));

    await this.prisma.surveyResponse.createMany({ data });

    return {
      message: 'Survey submitted successfully',
      data: {
        surveyId,
        userId: dto.user_id ?? null,
        submittedAnswers: data.length,
      },
    };
  }
}