import { IsObject, IsNotEmpty } from "class-validator";

export class UpdatePreferencesDto {
  @IsObject()
  @IsNotEmpty()
  preferences: Record<string, unknown>;
}
