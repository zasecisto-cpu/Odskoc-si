import { OpeningHours, OpeningHourRange } from '../types';

export interface OpenStatus {
  isOpen: boolean;
  statusText: string;
  badgeClass: string;
  closesSoon: boolean;
}

const DAYS_KEY: (keyof Omit<OpeningHours, 'summary'>)[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

const CZECH_DAYS: Record<keyof Omit<OpeningHours, 'summary'>, string> = {
  mon: 'pondělí',
  tue: 'úterý',
  wed: 'středa',
  thu: 'čtvrtek',
  fri: 'pátek',
  sat: 'sobota',
  sun: 'neděle',
};

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function getOpeningStatus(openingHours: OpeningHours, now = new Date()): OpenStatus {
  const dayIndex = now.getDay(); // 0 is Sun, 1 is Mon...
  const dayKey = DAYS_KEY[dayIndex];
  const todayRange: OpeningHourRange = openingHours[dayKey];

  if (!todayRange || !todayRange.open || !todayRange.close) {
    return {
      isOpen: false,
      statusText: 'Zavřeno',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
      closesSoon: false,
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(todayRange.open);
  const closeMinutes = parseTimeToMinutes(todayRange.close);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const minutesLeft = closeMinutes - currentMinutes;
    const closesSoon = minutesLeft <= 45;

    return {
      isOpen: true,
      statusText: closesSoon
        ? `Zavírá za ${minutesLeft} min (v ${todayRange.close})`
        : `Otevřeno do ${todayRange.close}`,
      badgeClass: closesSoon
        ? 'bg-[#F5B700] text-[#14294B] font-bold'
        : 'bg-emerald-500 text-white font-bold',
      closesSoon,
    };
  }

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      statusText: `Zavřeno · Otevírá dnes v ${todayRange.open}`,
      badgeClass: 'bg-slate-200 text-slate-700 font-semibold',
      closesSoon: false,
    };
  }

  // Find next day open time
  const nextDayKey = DAYS_KEY[(dayIndex + 1) % 7];
  const nextRange = openingHours[nextDayKey];
  const nextDayName = CZECH_DAYS[nextDayKey];

  return {
    isOpen: false,
    statusText: `Zavřeno · Otevírá v ${nextDayName} v ${nextRange?.open || '8:00'}`,
    badgeClass: 'bg-slate-200 text-slate-700 font-semibold',
    closesSoon: false,
  };
}
