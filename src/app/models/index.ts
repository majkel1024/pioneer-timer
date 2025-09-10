export interface ServiceEntry {
  id?: number;
  date: string;
  hours: number;
  type: string;
  notes?: string;
  timestamp: number;
}

export interface HourType {
  id: string;
  name: string;
  hasLimit: boolean;
}

export interface Settings {
  id?: number;
  yearlyGoal: number;
  hourTypes: HourType[];
}

export interface MonthlyData {
  totalHours: number;
  serviceHours: number;
  otherHours: number;
  overLimitHours: number;
  countableHours: number;
}

export interface ServiceYearData {
  totalHours: number;
  breakdown: Record<string, number>;
}

export interface DailyRequirement {
  monthlyRequirement: number;
  yearlyRequirement: number;
  daysRemainingInMonth: number;
  daysRemainingInYear: number;
}
