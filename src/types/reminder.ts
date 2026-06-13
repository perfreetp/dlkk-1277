export interface ReminderSetting {
  habitId: string;
  enabled: boolean;
  workdays: number[];
  timeSlots: string[];
  frequency: number;
  duration: number;
  isLunchBreakFree: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  isMeetingSkip: boolean;
  groupName?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  label: string;
}

export interface ReminderNotification {
  id: string;
  habitId: string;
  habitName: string;
  habitIcon: string;
  scheduledTime: string;
  status: 'pending' | 'completed' | 'snoozed' | 'skipped';
}
