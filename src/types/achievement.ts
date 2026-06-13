export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: {
    type: 'streak' | 'total' | 'frequency' | 'category';
    target: number;
    category?: string;
  };
}

export interface WeeklyReport {
  weekStartDate: string;
  weekEndDate: string;
  totalCheckIns: number;
  totalHabits: number;
  averageCompletionRate: number;
  bestStreak: number;
  improvements: string[];
  suggestions: string[];
}

export interface Encouragement {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  createdAt: string;
}

export interface Achievement {
  totalCheckIns: number;
  longestStreak: number;
  currentStreak: number;
  badges: Badge[];
  weeklyReports: WeeklyReport[];
  receivedEncouragements: Encouragement[];
  sentEncouragements: Encouragement[];
}
