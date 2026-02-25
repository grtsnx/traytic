import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsObject,
  IsUrl,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EventType {
  PAGEVIEW = 'pageview',
  CUSTOM = 'custom',
  VITAL = 'vital',
  ERROR = 'error',
}

export class EventDto {
  @IsEnum(EventType)
  type: EventType;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  utm_source?: string;

  @IsOptional()
  @IsString()
  utm_medium?: string;

  @IsOptional()
  @IsString()
  utm_campaign?: string;

  @IsOptional()
  @IsString()
  utm_content?: string;

  @IsOptional()
  @IsString()
  utm_term?: string;

  @IsOptional()
  @IsNumber()
  duration_ms?: number;

  @IsOptional()
  @IsString()
  vital_name?: string;

  @IsOptional()
  @IsNumber()
  vital_value?: number;

  @IsOptional()
  @IsString()
  vital_rating?: string;

  @IsOptional()
  @IsString()
  event_name?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, string>;

  @IsOptional()
  @IsString()
  error_message?: string;

  @IsOptional()
  @IsString()
  error_stack?: string;
}

export class CollectDto {
  @IsString()
  siteId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  events: EventDto[];
}
