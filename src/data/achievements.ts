import { Badge, WeeklyReport, Encouragement } from '@/types/achievement';

export const badgesData: Badge[] = [
  {
    id: 'badge-water-king',
    name: '喝水王者',
    description: '连续7天完成喝水习惯',
    icon: '👑',
    requirement: { type: 'streak', target: 7, category: 'water' }
  },
  {
    id: 'badge-stretch-master',
    name: '拉伸大师',
    description: '累计完成拉伸动作50次',
    icon: '🎯',
    requirement: { type: 'total', target: 50, category: 'stretch' }
  },
  {
    id: 'badge-eye-guardian',
    name: '护眼卫士',
    description: '连续14天完成护眼动作',
    icon: '🛡️',
    requirement: { type: 'streak', target: 14, category: 'eye' }
  },
  {
    id: 'badge-stand-up',
    name: '站立达人',
    description: '累计站立100次',
    icon: '🌟',
    requirement: { type: 'total', target: 100, category: 'stand' }
  },
  {
    id: 'badge-week-warrior',
    name: '周冠军',
    description: '单周完成率达到95%以上',
    icon: '🏆',
    requirement: { type: 'frequency', target: 95 }
  },
  {
    id: 'badge-month-hero',
    name: '月度英雄',
    description: '连续30天坚持完成所有习惯',
    icon: '🦸',
    requirement: { type: 'streak', target: 30 }
  },
  {
    id: 'badge-early-bird',
    name: '早起鸟',
    description: '在9点前完成第一个习惯',
    icon: '🐦',
    requirement: { type: 'frequency', target: 10 }
  },
  {
    id: 'badge-all-rounder',
    name: '全能选手',
    description: '同时激活所有类型的习惯',
    icon: '🎖️',
    requirement: { type: 'category', target: 4 }
  }
];

export const weeklyReportsData: WeeklyReport[] = [
  {
    weekStartDate: '2026-06-07',
    weekEndDate: '2026-06-13',
    totalCheckIns: 92,
    totalHabits: 28,
    averageCompletionRate: 88.5,
    bestStreak: 7,
    improvements: ['喝水频率提升了15%', '拉伸动作完成率保持稳定'],
    suggestions: ['建议增加午后的站立活动', '可以尝试新增眼保健操频次']
  },
  {
    weekStartDate: '2026-05-31',
    weekEndDate: '2026-06-06',
    totalCheckIns: 85,
    totalHabits: 28,
    averageCompletionRate: 81.2,
    bestStreak: 5,
    improvements: ['建立了固定的提醒习惯'],
    suggestions: ['注意工作繁忙时的习惯坚持', '午休后记得补充水分']
  }
];

export const encouragementsData: Encouragement[] = [
  {
    id: 'enc-1',
    fromUserId: 'user-002',
    fromUserName: '小李',
    toUserId: 'user-001',
    toUserName: '我',
    message: '太棒了！连续12天护眼，继续加油！💪',
    createdAt: '2026-06-12T18:30:00'
  },
  {
    id: 'enc-2',
    fromUserId: 'user-003',
    fromUserName: '小王',
    toUserId: 'user-001',
    toUserName: '我',
    message: '喝水达人一枚！🌊',
    createdAt: '2026-06-11T10:15:00'
  },
  {
    id: 'enc-3',
    fromUserId: 'user-001',
    fromUserName: '我',
    toUserId: 'user-002',
    toUserName: '小李',
    message: '今天也要记得拉伸哦！🧘',
    createdAt: '2026-06-10T14:20:00'
  }
];
