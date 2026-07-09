import { EIncidentStatus } from "@/services/api/equipment";

export const STATUS_COLORS: Record<EIncidentStatus, string> = {
  [EIncidentStatus.NEW]: 'orange',
  [EIncidentStatus.RESOLVED]: 'green',
};

export const STATUS_LABELS: Record<EIncidentStatus, string> = {
  [EIncidentStatus.NEW]: 'Новый',
  [EIncidentStatus.RESOLVED]: 'Решён',
};