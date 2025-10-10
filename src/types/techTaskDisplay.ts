export type TechTaskReadAllDisplay = {
  id: number;
  name: string;
  posId: number;
  type: string; 
  status: string;
  periodType?: string; 
  customPeriodDays?: number;
  endSpecifiedDate?: Date;
  startWorkDate?: Date;
  sendWorkDate?: Date;
  executorId?: number;
  posName?: string; // Added pos name (optional)
  executorName?: string; // Added executor name (optional)
  tags: {
    id: number;
    name: string;
    code?: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
    id: number;
  } | null;
  executor: {
    firstName: string;
    lastName: string;
    id: number;
  } | null;
};

export type TechTaskManagerDisplay = {
  id: number;
  name: string;
  posId: number;
  type: string; 
  status: string;
  periodType?: string; 
  customPeriodDays?: number;
  markdownDescription?: string;
  nextCreateDate?: Date;
  endSpecifiedDate?: Date;
  startDate: Date;
  items: {
    id: number;
    title: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  updatedById: number;
  tags: {
    id: number;
    name: string;
    code?: string;
  }[];
  posName?: string;
};
