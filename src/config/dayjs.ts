import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import i18n from '@/config/i18n';

dayjs.extend(updateLocale);
dayjs.updateLocale('en', { weekStart: 1 });
dayjs.updateLocale('ru', { weekStart: 1 });

export function syncDayjsLocale(language: string): void {
  dayjs.locale(language.startsWith('ru') ? 'ru' : 'en');
}

syncDayjsLocale(i18n.language);
