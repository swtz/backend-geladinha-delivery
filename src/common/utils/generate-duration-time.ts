import { getUnixTime, intervalToDuration } from 'date-fns';
import { padLeftWithChar } from './pad-left-with-char';
import { getTimeFromDateIsoString } from './get-time-from-date-iso-string';

export function generateDurationTime(fromTime: string, toTime: string): string {
  const initTime =
    fromTime.length > 8 ? getTimeFromDateIsoString(fromTime) : fromTime;
  const endTime = toTime.length > 8 ? getTimeFromDateIsoString(toTime) : toTime;
  const initDate = new Date(`1970-01-01T${initTime}`);
  const endDate = new Date(`1970-01-01T${endTime}`);
  const relativeEndDate =
    getUnixTime(initDate) > getUnixTime(endDate) || initTime === endTime
      ? new Date(`1970-01-02T${endTime}`)
      : endDate;
  const { days, hours, minutes, seconds } = intervalToDuration({
    start: initDate,
    end: relativeEndDate,
  });
  const d2Hours = hours ? padLeftWithChar(hours, '0') : '00';
  const d2Minutes = minutes ? padLeftWithChar(minutes, '0') : '00';
  const d2Seconds = seconds ? padLeftWithChar(seconds, '0') : '00';
  const duration =
    days === 1 ? '24:00:00' : `${d2Hours}:${d2Minutes}:${d2Seconds}`;
  return duration;
}
