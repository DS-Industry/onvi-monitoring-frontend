export const parseTimeToSeconds = (timeValue: string | number, t: (key: string) => string): number => {
  if (!timeValue || timeValue === '-') return 0;
  
  if (typeof timeValue === 'number') {
    return timeValue * 60;
  }
  
  if (typeof timeValue === 'string') {
    const hourUnit = t('time.hourShort') || 'ч';
    const minuteUnit = t('time.minuteShort') || 'мин';
    const secondUnit = t('time.secondShort') || 'сек';
    
    const hourRegex = new RegExp(`(\\d+)\\s*${hourUnit}`);
    const minuteRegex = new RegExp(`(\\d+)\\s*${minuteUnit}`);
    const secondRegex = new RegExp(`(\\d+)\\s*${secondUnit}`);
    
    let totalSeconds = 0;
    const hoursMatch = timeValue.match(hourRegex);
    const minutesMatch = timeValue.match(minuteRegex);
    const secondsMatch = timeValue.match(secondRegex);
    
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
    
    if (totalSeconds > 0) return totalSeconds;
    
    const num = parseFloat(timeValue.replace(',', '.'));
    if (!isNaN(num)) {
      return num * 60;
    }
  }
  
  return 0;
};

export const formatSecondsToTime = (seconds: number, t: (key: string) => string): string => {
  if (seconds === 0) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  
  const hourUnit = t('time.hourShort');
  const minuteUnit = t('time.minuteShort');
  const secondUnit = t('time.secondShort');
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} ${hourUnit}`);
  if (mins > 0) parts.push(`${mins} ${minuteUnit}`);
  if (secs > 0) parts.push(`${secs} ${secondUnit}`);
  
  return parts.length > 0 ? parts.join(' ') : `0 ${secondUnit}`;
};

export const formatTimeDisplay = (value: string | number, t: (key: string) => string): string => {
  if (!value || value === '-') return '-';
  
  if (typeof value === 'string') {
    const hourUnit = t('time.hourShort') || 'ч';
    const minuteUnit = t('time.minuteShort') || 'мин';
    const secondUnit = t('time.secondShort') || 'сек';
    
    if (value.includes(hourUnit) || value.includes(minuteUnit) || value.includes(secondUnit)) {
      return value;
    }
    
    if (value.includes(':')) {
      const [hoursStr, minutesStr, secondsStr] = value.split(':');
      const hours = parseInt(hoursStr) || 0;
      const minutes = parseInt(minutesStr) || 0;
      const seconds = parseInt(secondsStr) || 0;
      
      const parts = [];
      if (hours > 0) parts.push(`${hours} ${t('time.hourShort')}`);
      if (minutes > 0) parts.push(`${minutes} ${t('time.minuteShort')}`);
      if (seconds > 0) parts.push(`${seconds} ${t('time.secondShort')}`);
      
      return parts.length > 0 ? parts.join(' ') : `0 ${t('time.secondShort')}`;
    }
    
    const num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num)) {
      return formatSecondsToTime(num * 60, t);
    }
  }
  
  if (typeof value === 'number') {
    return formatSecondsToTime(value * 60, t);
  }
  
  return value.toString();
};

export const parseTimeToSecondsSimple = (timeValue: string | number): number => {
  if (!timeValue || timeValue === '-') return 0;
  
  if (typeof timeValue === 'number') {
    return timeValue * 60;
  }
  
  if (typeof timeValue === 'string') {
    let totalSeconds = 0;
    const hoursMatch = timeValue.match(/(\d+)\s*ч/);
    const minutesMatch = timeValue.match(/(\d+)\s*мин/);
    const secondsMatch = timeValue.match(/(\d+)\s*сек/);
    
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
    
    if (totalSeconds > 0) return totalSeconds;
    
    const num = parseFloat(timeValue.replace(',', '.'));
    if (!isNaN(num)) {
      return num * 60;
    }
  }
  
  return 0;
};

export const formatSecondsToTimeSimple = (seconds: number): string => {
  if (seconds === 0) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} ч`);
  if (mins > 0) parts.push(`${mins} мин`);
  if (secs > 0) parts.push(`${secs} сек`);
  
  return parts.length > 0 ? parts.join(' ') : '0 сек';
};