export interface Habit {
  id: string;
  name: string;
  category: 'water' | 'stretch' | 'eye' | 'stand' | 'walk';
  icon: string;
  description: string;
  duration: number;
  frequency: number;
  steps: string[];
  precautions: string[];
  alternatives: Array<{ id: string; name: string; icon: string }>;
}

export interface UserHabitSetting {
  habitId: string;
  enabled: boolean;
  workdays: number[];
  timeSlots: string[];
  frequency: number;
  completedToday: number;
  lastCompletedDate: string;
  streakDays: number;
  group?: string;
}

export interface CheckInRecord {
  date: string;
  habitId: string;
  status: 'completed' | 'skipped' | 'snoozed' | 'unsuitable';
  completedAt?: string;
  skipReason?: string;
}

export interface DailyStatistics {
  date: string;
  totalHabits: number;
  completed: number;
  skipped: number;
  missed: number;
  completionRate: number;
}

export interface OfficeStatus {
  isInMeeting: boolean;
  isOnLunchBreak: boolean;
  isWorking: boolean;
  nextMeetingTime?: string;
}
