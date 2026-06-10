import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateAvailabilityDto {
  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsString()
  availabilityReason?: string;
}
