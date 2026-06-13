import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useHabits } from '@/store/habitStore';
import { badgesData } from '@/data/achievements';
import { Habit } from '@/types/habit';
import { Encouragement } from '@/types/achievement';

const defaultReceivedEncouragements: Encouragement[] = [
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

const AchievementsPage: React.FC = () => {
  const { checkInRecords, userHabits, habits } = useHabits();
  const [badges, setBadges] = useState<any[]>([]);
  const [receivedEncouragements, setReceivedEncouragements] = useState<Encouragement[]>(defaultReceivedEncouragements);
  const [sentEncouragements, setSentEncouragements] = useState<Encouragement[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [checkInRecords, userHabits]);

  const loadData = () => {
    const completedRecords = checkInRecords.filter(r => r.status === 'completed');
    setTotalCheckIns(completedRecords.length);

    const completedDates = [...new Set(completedRecords.map(r => r.date))];
    const streak = calculateLongestStreak(completedDates);
    setLongestStreak(streak);
    setCurrentStreak(calculateCurrentStreak(completedDates));

    setBadges(calculateBadges(completedRecords, completedDates));
    setWeeklyReport(generateWeeklyReport(completedRecords));

    const savedReceived = Taro.getStorageSync('receivedEncouragements') || [];
    const savedSent = Taro.getStorageSync('sentEncouragements') || [];
    setReceivedEncouragements([...defaultReceivedEncouragements, ...savedReceived]);
    setSentEncouragements(savedSent);
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

  const handleSendEncouragement = () => {
    Taro.showActionSheet({
      itemList: colleagues.map(c => c.name),
      success: (res) => {
        if (res.tapIndex !== undefined) {
          const selectedColleague = colleagues[res.tapIndex];
          
          Taro.showActionSheet({
            itemList: encouragementMessages,
            success: (msgRes) => {
              if (msgRes.tapIndex !== undefined) {
                const selectedMessage = encouragementMessages[msgRes.tapIndex];
                
                Taro.showModal({
                  title: '发送鼓励',
                  content: `确定要发送给 ${selectedColleague.name}："${selectedMessage}" 吗？`,
                  confirmText: '发送',
                  success: (confirmRes) => {
                    if (confirmRes.confirm) {
                      const newEncouragement: Encouragement = {
                        id: `enc-${Date.now()}`,
                        fromUserId: 'user-001',
                        fromUserName: '我',
                        toUserId: selectedColleague.id,
                        toUserName: selectedColleague.name,
                        message: selectedMessage,
                        createdAt: new Date().toISOString()
                      };

                      const saved = Taro.getStorageSync('sentEncouragements') || [];
                      const updated = [...saved, newEncouragement];
                      Taro.setStorageSync('sentEncouragements', updated);
                      
                      setSentEncouragements(prev => [newEncouragement, ...prev]);
                      
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
          <Text className={styles.sectionTitle}>最长连续纪录</Text>
        </View>
        <View className={styles.streakCard}>
          <Text className={styles.streakIcon}>🏆</Text>
          <Text className={styles.streakValue}>{longestStreak} 天</Text>
          <Text className={styles.streakLabel}>连续完成所有习惯</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>本周报告</Text>
        </View>
        {weeklyReport && (
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
        </View>
        <View className={styles.encouragementList}>
          {(activeTab === 'received' ? receivedEncouragements : sentEncouragements).map(enc => (
            <View key={enc.id} className={styles.encouragementItem}>
              <View className={styles.encouragementAvatar}>
                <Text>{getAvatarText(activeTab === 'received' ? enc.fromUserName : enc.toUserName)}</Text>
              </View>
              <View className={styles.encouragementContent}>
                <Text className={styles.encouragementFrom}>
                  {activeTab === 'received' ? enc.fromUserName : `发给 ${enc.toUserName}`}
                </Text>
                <Text className={styles.encouragementMessage}>{enc.message}</Text>
                <Text className={styles.encouragementTime}>{formatDate(enc.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
        {activeTab === 'received' && receivedEncouragements.length === 0 && (
          <View className={styles.emptyEncouragement}>
            <Text className={styles.emptyIcon}>💬</Text>
            <Text className={styles.emptyText}>还没有收到同事的鼓励</Text>
          </View>
        )}
        {activeTab === 'sent' && sentEncouragements.length === 0 && (
          <View className={styles.emptyEncouragement}>
            <Text className={styles.emptyIcon}>📤</Text>
            <Text className={styles.emptyText}>还没有发送过鼓励</Text>
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
