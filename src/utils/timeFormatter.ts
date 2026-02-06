export const parseTimeToSeconds = (timeValue: string | number): number => {
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

export const formatSecondsToTime = (seconds: number): string => {
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

export const formatTimeDisplay = (value: string | number): string => {
  if (!value || value === '-') return '-';
  return value.toString();
};