import { isISO8601 } from 'class-validator';
import { getUnixTime, intervalToDuration } from 'date-fns';
import { padLeftWithChar } from './pad-left-with-char';
import { BadRequestException } from '@nestjs/common';
import { WorkTime } from 'src/work-time/entities/work-time.entity';
import { IntervalTime } from 'src/work-time/entities/interval-time.entity';

export function generateDurationTime(
  from: string,
  to: string,
  entityTime?: WorkTime | IntervalTime,
): string {
  if (
    (!isISO8601(from, { strict: true }) && from.length >= 19) ||
    (!isISO8601(to, { strict: true }) && to.length >= 19)
  ) {
    throw new BadRequestException('Data inválida');
  }
  const initTime = from.slice(11, 19);
  const endTime = to.slice(11, 19);
  const auxTime: { initHour: string; endHour: string; addOneDay: '01' | '02' } =
    {
      initHour: initTime,
      endHour: endTime,
      addOneDay: getUnixTime(from) > getUnixTime(to) ? '02' : '01',
    };
  if (entityTime) {
    if (initTime !== entityTime.initHour) {
      entityTime.initHour = initTime;
    }
    if (endTime !== entityTime.endHour) {
      entityTime.endHour = endTime;
    }
    auxTime.initHour = entityTime.initHour;
    auxTime.endHour = entityTime.endHour;
    auxTime.addOneDay = entityTime.initHour > entityTime.endHour ? '02' : '01';
  }

  const { hours, minutes, seconds } = intervalToDuration({
    start: `${from.slice(0, 7)}-01T${auxTime.initHour}`,
    end: `${from.slice(0, 7)}-${auxTime.addOneDay}T${auxTime.endHour}`,
  });
  const d2Hours = hours ? padLeftWithChar(hours, '0') : undefined;
  const d2Minutes = minutes ? padLeftWithChar(minutes, '0') : undefined;
  const d2Seconds = seconds ? padLeftWithChar(seconds, '0') : undefined;
  const duration = `${d2Hours || '00'}:${d2Minutes || '00'}:${d2Seconds || '00'}`;
  return duration;
}
