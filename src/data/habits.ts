import { Habit, UserHabitSetting, CheckInRecord, DailyStatistics } from '@/types/habit';

export const habitsData: Habit[] = [
  {
    id: 'water-1',
    name: '喝水提醒',
    category: 'water',
    icon: '💧',
    description: '保持身体水分充足，促进新陈代谢',
    duration: 1,
    frequency: 8,
    steps: [
      '准备一杯温水（约300ml）',
      '小口慢慢饮用',
      '避免一次性大量饮水'
    ],
    precautions: [
      '不要喝太冷或太热的水',
      '餐前半小时避免大量饮水',
      '肾功能异常者请遵医嘱'
    ],
    alternatives: [
      { id: 'tea-1', name: '喝杯茶', icon: '🍵' },
      { id: 'water-2', name: '喝温水', icon: '☕' }
    ]
  },
  {
    id: 'stretch-1',
    name: '颈部拉伸',
    category: 'stretch',
    icon: '🧘',
    description: '缓解颈部肌肉紧张，预防颈椎问题',
    duration: 3,
    frequency: 4,
    steps: [
      '坐直身体，肩膀放松',
      '将头缓慢向右侧倾斜，保持15秒',
      '回到中间，再向左侧倾斜，保持15秒',
      '最后做头部前后伸展'
    ],
    precautions: [
      '动作要缓慢，避免快速转动',
      '感到疼痛时立即停止',
      '颈椎病患者请谨慎进行'
    ],
    alternatives: [
      { id: 'stretch-2', name: '肩部环绕', icon: '💪' },
      { id: 'stretch-3', name: '手臂伸展', icon: '🙆' }
    ]
  },
  {
    id: 'stretch-2',
    name: '肩部放松',
    category: 'stretch',
    icon: '💪',
    description: '释放肩部压力，改善体态',
    duration: 3,
    frequency: 3,
    steps: [
      '双手放在肩膀上',
      '向前做肩部环绕10次',
      '向后做肩部环绕10次',
      '深呼吸放松'
    ],
    precautions: [
      '环绕动作要圆滑流畅',
      '双肩保持放松下垂',
      '如感不适请停止'
    ],
    alternatives: [
      { id: 'stretch-1', name: '颈部拉伸', icon: '🧘' },
      { id: 'walk-1', name: '走廊走动', icon: '🚶' }
    ]
  },
  {
    id: 'eye-1',
    name: '远眺休息',
    category: 'eye',
    icon: '👀',
    description: '缓解眼疲劳，保护视力',
    duration: 2,
    frequency: 6,
    steps: [
      '停下手中工作',
      '看向窗外最远的物体',
      '保持20秒',
      '眨眼放松，重复3次'
    ],
    precautions: [
      '不要在强光下直视太阳',
      '戴隐形眼镜者注意保湿',
      '如眼睛持续不适请就医'
    ],
    alternatives: [
      { id: 'eye-2', name: '眼保健操', icon: '🌿' },
      { id: 'eye-3', name: '闭目养神', icon: '😌' }
    ]
  },
  {
    id: 'eye-2',
    name: '眼保健操',
    category: 'eye',
    icon: '🌿',
    description: '通过穴位按摩缓解眼部疲劳',
    duration: 5,
    frequency: 2,
    steps: [
      '闭眼，用食指和中指轻按太阳穴',
      '顺时针、逆时针各按摩10圈',
      '用掌心轻捂眼睛，放松',
      '重复3次'
    ],
    precautions: [
      '按摩力度要轻柔',
      '手要保持清洁',
      '眼部感染时禁止按摩'
    ],
    alternatives: [
      { id: 'eye-1', name: '远眺休息', icon: '👀' },
      { id: 'eye-3', name: '闭目养神', icon: '😌' }
    ]
  },
  {
    id: 'stand-1',
    name: '站立活动',
    category: 'stand',
    icon: '🧍',
    description: '打破久坐，促进血液循环',
    duration: 2,
    frequency: 5,
    steps: [
      '站起来，伸展双臂',
      '左右转动腰部各10次',
      '踮起脚尖10次',
      '轻轻踢腿放松'
    ],
    precautions: [
      '站起时要缓慢，避免头晕',
      '穿高跟鞋者建议换鞋后进行',
      '站立不稳者可扶椅背'
    ],
    alternatives: [
      { id: 'walk-1', name: '走廊走动', icon: '🚶' },
      { id: 'stretch-2', name: '肩部放松', icon: '💪' }
    ]
  },
  {
    id: 'walk-1',
    name: '走廊走动',
    category: 'walk',
    icon: '🚶',
    description: '轻度运动，提升活力',
    duration: 5,
    frequency: 3,
    steps: [
      '离开座位，在走廊走动',
      '保持轻松步伐，不要太快',
      '走2-3分钟即可',
      '适当深呼吸'
    ],
    precautions: [
      '穿着舒适的鞋子',
      '避免打扰他人工作',
      '不要走太远'
    ],
    alternatives: [
      { id: 'stand-1', name: '站立活动', icon: '🧍' },
      { id: 'stretch-1', name: '颈部拉伸', icon: '🧘' }
    ]
  },
  {
    id: 'water-2',
    name: '泡杯茶',
    category: 'water',
    icon: '🍵',
    description: '补充水分的同时放松心情',
    duration: 3,
    frequency: 2,
    steps: [
      '准备茶叶或茶包',
      '用温水冲泡',
      '等待2-3分钟',
      '慢慢品尝'
    ],
    precautions: [
      '不要空腹喝茶',
      '晚上避免喝浓茶',
      '咖啡因敏感者注意'
    ],
    alternatives: [
      { id: 'water-1', name: '喝水提醒', icon: '💧' },
      { id: 'eye-3', name: '闭目养神', icon: '😌' }
    ]
  }
];

export const userHabitSettingsData: UserHabitSetting[] = [
  {
    habitId: 'water-1',
    enabled: true,
    workdays: [1, 2, 3, 4, 5],
    timeSlots: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'],
    frequency: 8,
    completedToday: 5,
    lastCompletedDate: '2026-06-13',
    streakDays: 7,
    group: '健康饮品'
  },
  {
    habitId: 'stretch-1',
    enabled: true,
    workdays: [1, 2, 3, 4, 5],
    timeSlots: ['10:00', '12:30', '15:00', '17:30'],
    frequency: 4,
    completedToday: 2,
    lastCompletedDate: '2026-06-13',
    streakDays: 5,
    group: '身体放松'
  },
  {
    habitId: 'eye-1',
    enabled: true,
    workdays: [1, 2, 3, 4, 5],
    timeSlots: ['10:15', '11:45', '14:15', '16:45', '18:15', '19:45'],
    frequency: 6,
    completedToday: 4,
    lastCompletedDate: '2026-06-13',
    streakDays: 12,
    group: '眼睛保护'
  },
  {
    habitId: 'stand-1',
    enabled: true,
    workdays: [1, 2, 3, 4, 5],
    timeSlots: ['11:00', '13:00', '15:30', '17:00', '18:30'],
    frequency: 5,
    completedToday: 3,
    lastCompletedDate: '2026-06-13',
    streakDays: 3,
    group: '身体放松'
  }
];

export const checkInRecordsData: CheckInRecord[] = [
  { date: '2026-06-12', habitId: 'water-1', status: 'completed', completedAt: '2026-06-12T09:15:00' },
  { date: '2026-06-12', habitId: 'stretch-1', status: 'completed', completedAt: '2026-06-12T10:05:00' },
  { date: '2026-06-12', habitId: 'eye-1', status: 'skipped', skipReason: '临时会议' },
  { date: '2026-06-12', habitId: 'stand-1', status: 'completed', completedAt: '2026-06-12T11:02:00' },
  { date: '2026-06-11', habitId: 'water-1', status: 'completed', completedAt: '2026-06-11T09:20:00' },
  { date: '2026-06-11', habitId: 'stretch-1', status: 'completed', completedAt: '2026-06-11T10:10:00' },
  { date: '2026-06-11', habitId: 'eye-1', status: 'completed', completedAt: '2026-06-11T10:18:00' },
  { date: '2026-06-11', habitId: 'stand-1', status: 'unsuitable', skipReason: '腰不舒服' }
];

export const dailyStatisticsData: DailyStatistics[] = [
  { date: '2026-06-13', totalHabits: 4, completed: 14, skipped: 0, missed: 2, completionRate: 87.5 },
  { date: '2026-06-12', totalHabits: 4, completed: 15, skipped: 1, missed: 2, completionRate: 83.3 },
  { date: '2026-06-11', totalHabits: 4, completed: 14, skipped: 0, missed: 3, completionRate: 82.4 },
  { date: '2026-06-10', totalHabits: 4, completed: 16, skipped: 0, missed: 1, completionRate: 94.1 },
  { date: '2026-06-09', totalHabits: 4, completed: 15, skipped: 1, missed: 2, completionRate: 83.3 },
  { date: '2026-06-08', totalHabits: 4, completed: 17, skipped: 0, missed: 0, completionRate: 100 },
  { date: '2026-06-07', totalHabits: 4, completed: 15, skipped: 1, missed: 1, completionRate: 88.2 }
];
