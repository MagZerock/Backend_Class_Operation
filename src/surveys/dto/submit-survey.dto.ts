import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayMinSize, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class SurveyAnswerDto {
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SubmitSurveyDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerDto)
  responses: SurveyAnswerDto[];
}
