import { OfficeStatus } from '@/types/habit';

export const officeStatusData: OfficeStatus = {
  isInMeeting: false,
  isOnLunchBreak: false,
  isWorking: true,
  nextMeetingTime: '14:00'
};

export const habitGroupsData = [
  { id: 'group-1', name: '健康饮品', icon: '🥤', color: '#3B82F6' },
  { id: 'group-2', name: '身体放松', icon: '💆', color: '#10B981' },
  { id: 'group-3', name: '眼睛保护', icon: '👁️', color: '#8B5CF6' },
  { id: 'group-4', name: '轻度运动', icon: '🏃', color: '#F59E0B' }
];

export const weekDayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
export const weekDayShortNames = ['日', '一', '二', '三', '四', '五', '六'];
