import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { SurveysService } from "./surveys.service";
import { SubmitSurveyDto } from "./dto/submit-survey.dto";

@Controller("surveys")
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  findAll() {
    return this.surveysService.findAll();
  }

  @Get(":surveyId")
  findOne(@Param("surveyId") surveyId: string) {
    return this.surveysService.findOne(surveyId);
  }

  @Post(":surveyId/submit")
  @HttpCode(201)
  submit(@Param("surveyId") surveyId: string, @Body() dto: SubmitSurveyDto) {
    return this.surveysService.submit(surveyId, dto);
  }
}
