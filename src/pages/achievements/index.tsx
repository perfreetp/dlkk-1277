import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useHabits } from '@/store/habitStore';
import { badgesData } from '@/data/achievements';
import { Habit } from '@/types/habit';
import { Encouragement, EncouragementThread } from '@/types/achievement';

const defaultReceivedEncouragements: Encouragement[] = [
  {
    id: 'enc-1',
    parentId: undefined,
    fromUserId: 'user-002',
    fromUserName: '小李',
    toUserId: 'user-001',
    toUserName: '我',
    message: '太棒了！连续12天护眼，继续加油！💪',
    createdAt: '2026-06-12T18:30:00'
  },
  {
    id: 'enc-2',
    parentId: undefined,
    fromUserId: 'user-003',
    fromUserName: '小王',
    toUserId: 'user-001',
    toUserName: '我',
    message: '喝水达人一枚！🌊',
    createdAt: '2026-06-11T10:15:00'
  }
];

const encouragementMessages = [
  '太棒了，继续加油！💪',
  '保持好习惯，你真厉害！🌟',
  '今天也要坚持哦！🎯',
  '健康生活从现在开始！✨',
  '你真是一个自律的人！👏',
  '一起养成好习惯吧！🤝',
  '注意身体，劳逸结合！😊',
  '加油，你是最好的！🌈'
];

const colleagues = [
  { id: 'user-002', name: '小李', avatar: '李' },
  { id: 'user-003', name: '小王', avatar: '王' },
  { id: 'user-004', name: '张姐', avatar: '张' },
  { id: 'user-005', name: '陈哥', avatar: '陈' }
];

type ReviewPeriod = 'week' | 'month';
type ReviewTab = 'overview' | 'review';

const AchievementsPage: React.FC = () => {
  const { checkInRecords, userHabits, habits } = useHabits();
  const [badges, setBadges] = useState<any[]>([]);
  const [receivedEncouragements, setReceivedEncouragements] = useState<Encouragement[]>(defaultReceivedEncouragements);
  const [sentEncouragements, setSentEncouragements] = useState<Encouragement[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [reviewTab, setReviewTab] = useState<ReviewTab>('overview');
  const [reviewPeriod, setReviewPeriod] = useState<ReviewPeriod>('week');
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<any>(null);
  const [encouragementThreads, setEncouragementThreads] = useState<EncouragementThread[]>([]);

  useEffect(() => {
    loadData();
  }, [checkInRecords, userHabits]);

  useEffect(() => {
    if (checkInRecords.length > 0) {
      setCategoryStats(calculateCategoryStats(reviewPeriod));
    }
  }, [reviewPeriod, checkInRecords, userHabits]);

  const loadData = () => {
    const completedRecords = checkInRecords.filter(r => r.status === 'completed');
    setTotalCheckIns(completedRecords.length);

    const completedDates = [...new Set(completedRecords.map(r => r.date))];
    const streak = calculateLongestStreak(completedDates);
    setLongestStreak(streak);
    setCurrentStreak(calculateCurrentStreak(completedDates));

    setBadges(calculateBadges(completedRecords, completedDates));
    setWeeklyReport(generateWeeklyReport(completedRecords));
    setCategoryStats(calculateCategoryStats(reviewPeriod));

    const savedReceived = Taro.getStorageSync('receivedEncouragements') || [];
    const savedSent = Taro.getStorageSync('sentEncouragements') || [];
    setReceivedEncouragements([...defaultReceivedEncouragements, ...savedReceived]);
    setSentEncouragements(savedSent);
    loadEncouragementThreads();
  };

  const loadEncouragementThreads = () => {
    const received = Taro.getStorageSync('receivedEncouragements') || [];
    const sent = Taro.getStorageSync('sentEncouragements') || [];
    const allEnc = [...received, ...sent].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const threads: EncouragementThread[] = [];
    const userMap = new Map<string, Encouragement[]>();
    
    allEnc.forEach(enc => {
      const otherUserId = enc.fromUserId === 'user-001' ? enc.toUserId : enc.fromUserId;
      const key = enc.fromUserId === 'user-001' ? `sent-${otherUserId}` : `received-${enc.fromUserId}`;
      if (!userMap.has(key)) {
        userMap.set(key, []);
      }
      userMap.get(key)!.push(enc);
    });

    userMap.forEach((messages, key) => {
      const firstMsg = messages[0];
      const otherUserId = firstMsg.fromUserId === 'user-001' ? firstMsg.toUserId : firstMsg.fromUserId;
      const colleague = colleagues.find(c => c.id === otherUserId);
      threads.push({
        id: key,
        colleagueId: otherUserId,
        colleagueName: colleague?.name || (firstMsg.fromUserId === 'user-001' ? firstMsg.toUserName : firstMsg.fromUserName),
        messages: messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        lastMessage: messages[messages.length - 1],
        lastMessageTime: messages[messages.length - 1].createdAt,
        isSent: firstMsg.fromUserId === 'user-001'
      });
    });

    setEncouragementThreads(threads.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    ));
  };

  const calculateLongestStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...dates].sort();
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  };

  const calculateCurrentStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const sortedDates = [...dates].sort().reverse();
    const latestDate = sortedDates[0];
    
    if (latestDate !== todayStr && latestDate !== yesterdayStr) {
      return 0;
    }
    
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateBadges = (records: any[], dates: string[]) => {
    return badgesData.map(badge => {
      let unlocked = false;
      
      switch (badge.requirement.type) {
        case 'streak':
          if (badge.requirement.category) {
            const categoryRecords = records.filter(r => {
              const habit = habits.find((h: Habit) => h.id === r.habitId);
              return habit && habit.category === badge.requirement.category;
            });
            const categoryDates = [...new Set(categoryRecords.map(r => r.date))];
            unlocked = calculateLongestStreak(categoryDates) >= badge.requirement.target;
          } else {
            unlocked = calculateLongestStreak(dates) >= badge.requirement.target;
          }
          break;
        case 'total':
          if (badge.requirement.category) {
            const categoryRecords = records.filter(r => {
              const habit = habits.find((h: Habit) => h.id === r.habitId);
              return habit && habit.category === badge.requirement.category;
            });
            unlocked = categoryRecords.length >= badge.requirement.target;
          } else {
            unlocked = records.length >= badge.requirement.target;
          }
          break;
        case 'frequency':
          if (dates.length >= 7) {
            const weeklyRecords = records.filter(r => {
              const recordDate = new Date(r.date);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return recordDate >= weekAgo;
            });
            const weeklyDates = [...new Set(weeklyRecords.map(r => r.date))];
            const avgCompletion = weeklyDates.length / 7 * 100;
            unlocked = avgCompletion >= badge.requirement.target;
          }
          break;
        case 'category':
          const activeCategories = [...new Set(
            userHabits.map(s => {
              const habit = habits.find((h: Habit) => h.id === s.habitId);
              return habit?.category;
            }).filter(Boolean)
          )];
          unlocked = activeCategories.length >= badge.requirement.target;
          break;
      }
      
      return { ...badge, unlocked };
    });
  };

  const generateWeeklyReport = (records: any[]) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    const weekRecords = records.filter(r => r.date >= weekStartStr && r.date <= weekEndStr);
    const weekDates = [...new Set(weekRecords.map(r => r.date))];
    
    const totalHabits = userHabits.length;
    const totalCheckIns = weekRecords.length;
    const expectedCheckIns = weekDates.length * totalHabits;
    const completionRate = expectedCheckIns > 0 ? Math.round((totalCheckIns / expectedCheckIns) * 100) : 0;
    const bestStreak = calculateLongestStreak(weekDates);
    
    const improvements: string[] = [];
    const suggestions: string[] = [];
    
    if (completionRate >= 80) {
      improvements.push('本周完成率表现优秀！');
    }
    if (bestStreak >= 5) {
      improvements.push(`连续${bestStreak}天坚持打卡，继续保持！`);
    }
    if (totalCheckIns >= 20) {
      improvements.push(`本周打卡${totalCheckIns}次，非常努力！`);
    }
    
    if (completionRate < 70) {
      suggestions.push('建议设置更合理的提醒时间');
    }
    if (totalHabits > 0 && weekDates.length < 5) {
      suggestions.push('记得周末也要坚持好习惯哦');
    }
    
    return {
      weekStartDate: weekStartStr,
      weekEndDate: weekEndStr,
      totalCheckIns,
      totalHabits,
      averageCompletionRate: completionRate,
      bestStreak,
      improvements: improvements.length > 0 ? improvements : ['继续保持良好的打卡习惯！'],
      suggestions: suggestions.length > 0 ? suggestions : ['暂无特别建议，继续加油！']
    };
  };

  const calculateCategoryStats = (period: ReviewPeriod) => {
    const now = new Date();
    const days = period === 'week' ? 7 : 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const categoryMap = new Map<string, {
      name: string;
      icon: string;
      totalRecords: number;
      dates: string[];
      streak: number;
      trend: number[];
    }>();

    const userHabitMap = new Map<string, string>();
    userHabits.forEach(s => {
      const habit = habits.find(h => h.id === s.habitId);
      if (habit) {
        userHabitMap.set(s.habitId, habit.category);
      }
    });

    const periodRecords = checkInRecords.filter(r => 
      r.status === 'completed' && r.date >= startStr && r.date <= todayStr
    );

    periodRecords.forEach(r => {
      const category = userHabitMap.get(r.habitId);
      if (!category) return;

      const categoryNames: Record<string, string> = {
        'water': '健康饮品',
        'stretch': '身体放松',
        'eye': '眼睛保护',
        'stand': '轻度运动',
        'walk': '轻度运动'
      };
      const categoryIcons: Record<string, string> = {
        'water': '💧',
        'stretch': '🧘',
        'eye': '👁️',
        'stand': '🏃',
        'walk': '🚶'
      };

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: categoryNames[category] || '其他',
          icon: categoryIcons[category] || '📌',
          totalRecords: 0,
          dates: [],
          streak: 0,
          trend: []
        });
      }

      const stat = categoryMap.get(category)!;
      stat.totalRecords++;
      if (!stat.dates.includes(r.date)) {
        stat.dates.push(r.date);
      }
    });

    categoryMap.forEach(stat => {
      stat.dates.sort();
      stat.streak = calculateLongestStreak(stat.dates);
      
      const dateSet = new Set(stat.dates);
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        stat.trend.push(dateSet.has(dateStr) ? 1 : 0);
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.totalRecords - a.totalRecords);
  };

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const stat = categoryStats.find(s => s.name === categoryName);
    if (stat) {
      setCategoryDetail({
        ...stat,
        records: checkInRecords.filter(r => {
          const habit = userHabits.find(s => {
            const h = habits.find(h => h.id === s.habitId);
            return h?.category === stat.name;
          });
          return habit && r.habitId === habit.habitId && r.status === 'completed';
        }).slice(-5)
      });
    }
    Taro.navigateTo({
      url: `/pages/category-detail/index?category=${encodeURIComponent(categoryName)}&stats=${encodeURIComponent(JSON.stringify(stat))}`
    });
  };

  const handleSendEncouragement = () => {
    Taro.showActionSheet({
      itemList: colleagues.map(c => c.name),
      success: (res) => {
        if (res.tapIndex !== undefined) {
          const selectedColleague = colleagues[res.tapIndex];
          
          Taro.showModal({
            title: '选择消息或自定义',
            confirmText: '发送',
            cancelText: '取消',
            editable: true,
            placeholderText: '输入你想说的话（选填）',
            success: (msgRes) => {
              if (msgRes.confirm) {
                const message = msgRes.content?.trim() || encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
                
                Taro.showModal({
                  title: '发送鼓励',
                  content: `发送给 ${selectedColleague.name}："${message}"`,
                  confirmText: '发送',
                  success: (confirmRes) => {
                    if (confirmRes.confirm) {
                      const newEncouragement: Encouragement = {
                        id: `enc-${Date.now()}`,
                        parentId: undefined,
                        fromUserId: 'user-001',
                        fromUserName: '我',
                        toUserId: selectedColleague.id,
                        toUserName: selectedColleague.name,
                        message: message,
                        createdAt: new Date().toISOString()
                      };

                      const saved = Taro.getStorageSync('sentEncouragements') || [];
                      const updated = [...saved, newEncouragement];
                      Taro.setStorageSync('sentEncouragements', updated);
                      
                      setSentEncouragements(prev => [newEncouragement, ...prev]);
                      loadEncouragementThreads();
                      
                      Taro.showToast({
                        title: '鼓励已发送！',
                        icon: 'success',
                        duration: 2000
                      });
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  };

  const handleReply = (thread: EncouragementThread) => {
    Taro.showModal({
      title: `回复 ${thread.colleagueName}`,
      confirmText: '发送',
      cancelText: '取消',
      editable: true,
      placeholderText: '输入你想说的话',
      success: (res) => {
        if (res.confirm && res.content?.trim()) {
          const newEncouragement: Encouragement = {
            id: `enc-${Date.now()}`,
            parentId: thread.lastMessage?.id,
            fromUserId: 'user-001',
            fromUserName: '我',
            toUserId: thread.colleagueId,
            toUserName: thread.colleagueName,
            message: res.content.trim(),
            createdAt: new Date().toISOString()
          };

          const saved = Taro.getStorageSync('sentEncouragements') || [];
          const updated = [...saved, newEncouragement];
          Taro.setStorageSync('sentEncouragements', updated);
          
          setSentEncouragements(prev => [newEncouragement, ...prev]);
          loadEncouragementThreads();
          
          Taro.showToast({
            title: '已回复！',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  };

  const getAvatarText = (name: string) => {
    return name.substring(0, 1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  const renderTrendChart = (trend: number[]) => {
    const maxHeight = 40;
    const barWidth = 100 / trend.length;
    
    return (
      <View className={styles.trendChart}>
        {trend.map((val, idx) => (
          <View
            key={idx}
            className={`${styles.trendBar} ${val === 1 ? styles.completed : styles.missed}`}
            style={{
              height: `${maxHeight}rpx`,
              width: `${barWidth}%`
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.userName}>我的成就</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalCheckIns}</Text>
            <Text className={styles.statLabel}>总打卡</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{currentStreak}</Text>
            <Text className={styles.statLabel}>当前连续</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{longestStreak}</Text>
            <Text className={styles.statLabel}>最长连续</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>我的徽章</Text>
          <Text className={styles.sectionMore}>
            {badges.filter(b => b.unlocked).length}/{badges.length} 已解锁
          </Text>
        </View>
        <View className={styles.badgeGrid}>
          {badges.map(badge => (
            <View 
              key={badge.id} 
              className={`${styles.badgeItem} ${!badge.unlocked ? styles.locked : ''}`}
            >
              <Text className={styles.badgeIcon}>{badge.icon}</Text>
              <Text className={styles.badgeName}>{badge.name}</Text>
              {badge.unlocked && (
                <Text className={styles.badgeDesc}>{badge.description}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>成就复盘</Text>
        </View>
        <View className={styles.reviewTabs}>
          <View 
            className={`${styles.reviewTab} ${reviewTab === 'overview' ? styles.active : ''}`}
            onClick={() => setReviewTab('overview')}
          >
            <Text>总览</Text>
          </View>
          <View 
            className={`${styles.reviewTab} ${reviewTab === 'review' ? styles.active : ''}`}
            onClick={() => setReviewTab('review')}
          >
            <Text>复盘</Text>
          </View>
        </View>

        {reviewTab === 'overview' && weeklyReport && (
          <View className={styles.overviewContent}>
            <View className={styles.streakCard}>
              <Text className={styles.streakIcon}>🏆</Text>
              <Text className={styles.streakValue}>{longestStreak} 天</Text>
              <Text className={styles.streakLabel}>最长连续纪录</Text>
            </View>
            <View className={styles.reportCard}>
              <View className={styles.reportHeader}>
                <Text className={styles.reportDate}>
                  {weeklyReport.weekStartDate} ~ {weeklyReport.weekEndDate}
                </Text>
                <Text className={styles.reportRate}>
                  {weeklyReport.averageCompletionRate}% 完成率
                </Text>
              </View>
              <View className={styles.reportStats}>
                <View className={styles.reportStat}>
                  <Text className={styles.reportStatValue}>{weeklyReport.totalCheckIns}</Text>
                  <Text className={styles.reportStatLabel}>本周打卡</Text>
                </View>
                <View className={styles.reportStat}>
                  <Text className={styles.reportStatValue}>{weeklyReport.totalHabits}</Text>
                  <Text className={styles.reportStatLabel}>习惯数量</Text>
                </View>
                <View className={styles.reportStat}>
                  <Text className={styles.reportStatValue}>{weeklyReport.bestStreak}</Text>
                  <Text className={styles.reportStatLabel}>本周连续</Text>
                </View>
              </View>
              {weeklyReport.improvements.map((imp: string, i: number) => (
                <Text key={i} className={styles.reportImprovement}>✓ {imp}</Text>
              ))}
              {weeklyReport.suggestions.map((sug: string, i: number) => (
                <Text key={i} className={styles.reportSuggestion}>💡 {sug}</Text>
              ))}
            </View>
          </View>
        )}

        {reviewTab === 'review' && (
          <View className={styles.reviewContent}>
            <View className={styles.periodTabs}>
              <View 
                className={`${styles.periodTab} ${reviewPeriod === 'week' ? styles.active : ''}`}
                onClick={() => setReviewPeriod('week')}
              >
                <Text>本周</Text>
              </View>
              <View 
                className={`${styles.periodTab} ${reviewPeriod === 'month' ? styles.active : ''}`}
                onClick={() => setReviewPeriod('month')}
              >
                <Text>本月</Text>
              </View>
            </View>

            {categoryStats.length > 0 ? (
              <View className={styles.categoryList}>
                {categoryStats.map((stat, idx) => {
                  const completionRate = stat.dates.length / (reviewPeriod === 'week' ? 7 : 30) * 100;
                  const isStable = completionRate >= 70;
                  return (
                    <View 
                      key={idx} 
                      className={styles.categoryItem}
                      onClick={() => handleCategoryPress(stat.name)}
                    >
                      <View className={styles.categoryIcon}>
                        <Text>{stat.icon}</Text>
                      </View>
                      <View className={styles.categoryInfo}>
                        <Text className={styles.categoryName}>{stat.name}</Text>
                        <Text className={styles.categoryStats}>
                          {stat.totalRecords}次打卡 · 连续{stat.streak}天
                        </Text>
                      </View>
                      <View className={styles.categoryTrend}>
                        <View className={styles.trendChart}>
                          {renderTrendChart(stat.trend)}
                        </View>
                        <Text className={`${styles.stabilityTag} ${isStable ? styles.stable : styles.unstable}`}>
                          {isStable ? '稳定' : '待提升'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className={styles.emptyReview}>
                <Text className={styles.emptyIcon}>📊</Text>
                <Text className={styles.emptyText}>暂无复盘数据</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>同事互动</Text>
        </View>
        <View className={styles.encouragementTabs}>
          <View 
            className={`${styles.tabItem} ${activeTab === 'received' ? styles.active : ''}`}
            onClick={() => setActiveTab('received')}
          >
            <Text>收到的鼓励</Text>
            <Text className={styles.tabCount}>{receivedEncouragements.length}</Text>
          </View>
          <View 
            className={`${styles.tabItem} ${activeTab === 'sent' ? styles.active : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <Text>发出的鼓励</Text>
            <Text className={styles.tabCount}>{sentEncouragements.length}</Text>
          </View>
          <View 
            className={`${styles.tabItem} ${activeTab === 'threads' ? styles.active : ''}`}
            onClick={() => setActiveTab('threads')}
          >
            <Text>对话</Text>
            <Text className={styles.tabCount}>{encouragementThreads.length}</Text>
          </View>
        </View>

        {activeTab === 'received' && (
          <View className={styles.encouragementList}>
            {receivedEncouragements.map(enc => (
              <View key={enc.id} className={styles.encouragementItem}>
                <View className={styles.encouragementAvatar}>
                  <Text>{getAvatarText(enc.fromUserName)}</Text>
                </View>
                <View className={styles.encouragementContent}>
                  <Text className={styles.encouragementFrom}>{enc.fromUserName}</Text>
                  <Text className={styles.encouragementMessage}>{enc.message}</Text>
                  <Text className={styles.encouragementTime}>{formatDate(enc.createdAt)}</Text>
                </View>
                <View 
                  className={styles.replyButton}
                  onClick={() => handleReply({
                    id: `reply-to-${enc.id}`,
                    colleagueId: enc.fromUserId,
                    colleagueName: enc.fromUserName,
                    messages: [],
                    lastMessage: enc,
                    lastMessageTime: enc.createdAt,
                    isSent: false
                  })}
                >
                  <Text>回复</Text>
                </View>
              </View>
            ))}
            {receivedEncouragements.length === 0 && (
              <View className={styles.emptyEncouragement}>
                <Text className={styles.emptyIcon}>💬</Text>
                <Text className={styles.emptyText}>还没有收到同事的鼓励</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'sent' && (
          <View className={styles.encouragementList}>
            {sentEncouragements.map(enc => (
              <View key={enc.id} className={styles.encouragementItem}>
                <View className={`${styles.encouragementAvatar} ${styles.sent}`}>
                  <Text>{getAvatarText(enc.toUserName)}</Text>
                </View>
                <View className={styles.encouragementContent}>
                  <Text className={styles.encouragementFrom}>发给 {enc.toUserName}</Text>
                  <Text className={styles.encouragementMessage}>{enc.message}</Text>
                  <Text className={styles.encouragementTime}>{formatDate(enc.createdAt)}</Text>
                </View>
              </View>
            ))}
            {sentEncouragements.length === 0 && (
              <View className={styles.emptyEncouragement}>
                <Text className={styles.emptyIcon}>📤</Text>
                <Text className={styles.emptyText}>还没有发送过鼓励</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'threads' && (
          <View className={styles.threadList}>
            {encouragementThreads.map(thread => (
              <View 
                key={thread.id} 
                className={styles.threadItem}
                onClick={() => handleReply(thread)}
              >
                <View className={styles.threadAvatar}>
                  <Text>{getAvatarText(thread.colleagueName)}</Text>
                </View>
                <View className={styles.threadInfo}>
                  <View className={styles.threadHeader}>
                    <Text className={styles.threadName}>{thread.colleagueName}</Text>
                    <Text className={styles.threadTime}>{formatDate(thread.lastMessageTime)}</Text>
                  </View>
                  <Text className={styles.threadPreview}>
                    {thread.isSent ? '你：' : ''}{thread.lastMessage?.message}
                  </Text>
                  <Text className={styles.threadCount}>
                    {thread.messages.length} 条消息
                  </Text>
                </View>
              </View>
            ))}
            {encouragementThreads.length === 0 && (
              <View className={styles.emptyEncouragement}>
                <Text className={styles.emptyIcon}>💬</Text>
                <Text className={styles.emptyText}>还没有和同事互动过</Text>
              </View>
            )}
          </View>
        )}

        <View className={styles.sendButton} onClick={handleSendEncouragement}>
          <Text className={styles.sendButtonText}>💬 鼓励同事</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AchievementsPage;
