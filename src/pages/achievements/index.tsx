import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useHabits } from '@/store/habitStore';
import { badgesData, weeklyReportsData } from '@/data/achievements';

interface Encouragement {
  id: string;
  fromUserId: string;
  fromUserName: string;
  message: string;
  createdAt: string;
}

const defaultEncouragements: Encouragement[] = [
  {
    id: 'enc-1',
    fromUserId: 'user-002',
    fromUserName: '小李',
    message: '太棒了！连续12天护眼，继续加油！💪',
    createdAt: '2026-06-12T18:30:00'
  },
  {
    id: 'enc-2',
    fromUserId: 'user-003',
    fromUserName: '小王',
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

const AchievementsPage: React.FC = () => {
  const { checkInRecords, userHabits } = useHabits();
  const [badges, setBadges] = useState<any[]>([]);
  const [reports] = useState(weeklyReportsData);
  const [encouragements, setEncouragements] = useState<Encouragement[]>(defaultEncouragements);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

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

    const unlockedBadges = badgesData.map((badge, idx) => ({
      ...badge,
      unlocked: completedRecords.length >= (idx + 1) * 10
    }));
    setBadges(unlockedBadges);

    const savedEncouragements = Taro.getStorageSync('encouragements');
    if (savedEncouragements && savedEncouragements.length > 0) {
      setEncouragements([...defaultEncouragements, ...savedEncouragements]);
    }
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

  const handleSendEncouragement = () => {
    Taro.showActionSheet({
      itemList: encouragementMessages,
      success: (res) => {
        if (res.tapIndex !== undefined) {
          const selectedMessage = encouragementMessages[res.tapIndex];
          
          Taro.showModal({
            title: '发送鼓励',
            content: `确定要发送："${selectedMessage}" 吗？`,
            confirmText: '发送',
            success: (confirmRes) => {
              if (confirmRes.confirm) {
                const newEncouragement: Encouragement = {
                  id: `enc-${Date.now()}`,
                  fromUserId: 'user-001',
                  fromUserName: '我',
                  message: selectedMessage,
                  createdAt: new Date().toISOString()
                };

                const saved = Taro.getStorageSync('encouragements') || [];
                const updatedEncouragements = [...saved, newEncouragement];
                Taro.setStorageSync('encouragements', updatedEncouragements);
                
                setEncouragements(prev => [newEncouragement, ...prev]);
                
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
          <Text className={styles.sectionMore}>查看全部 ›</Text>
        </View>
        <View className={styles.badgeGrid}>
          {badges.map(badge => (
            <View 
              key={badge.id} 
              className={`${styles.badgeItem} ${!badge.unlocked ? styles.locked : ''}`}
            >
              <Text className={styles.badgeIcon}>{badge.icon}</Text>
              <Text className={styles.badgeName}>{badge.name}</Text>
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
          <Text className={styles.sectionTitle}>周报</Text>
          <Text className={styles.sectionMore}>历史周报 ›</Text>
        </View>
        {reports.map((report, idx) => (
          <View key={idx} className={styles.reportCard}>
            <View className={styles.reportHeader}>
              <Text className={styles.reportDate}>
                {report.weekStartDate} ~ {report.weekEndDate}
              </Text>
              <Text className={styles.reportRate}>
                {report.averageCompletionRate}% 完成率
              </Text>
            </View>
            <View className={styles.reportStats}>
              <View className={styles.reportStat}>
                <Text className={styles.reportStatValue}>{report.totalCheckIns}</Text>
                <Text className={styles.reportStatLabel}>总打卡</Text>
              </View>
              <View className={styles.reportStat}>
                <Text className={styles.reportStatValue}>{report.totalHabits}</Text>
                <Text className={styles.reportStatLabel}>总习惯</Text>
              </View>
              <View className={styles.reportStat}>
                <Text className={styles.reportStatValue}>{report.bestStreak}</Text>
                <Text className={styles.reportStatLabel}>最佳连续</Text>
              </View>
            </View>
            {report.improvements.map((imp: string, i: number) => (
              <Text key={i} className={styles.reportImprovement}>{imp}</Text>
            ))}
            {report.suggestions.map((sug: string, i: number) => (
              <Text key={i} className={styles.reportSuggestion}>{sug}</Text>
            ))}
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>同事鼓励</Text>
        </View>
        <View className={styles.encouragementList}>
          {encouragements.map(enc => (
            <View key={enc.id} className={styles.encouragementItem}>
              <View className={styles.encouragementAvatar}>
                <Text>{getAvatarText(enc.fromUserName)}</Text>
              </View>
              <View className={styles.encouragementContent}>
                <Text className={styles.encouragementFrom}>
                  {enc.fromUserName}
                </Text>
                <Text className={styles.encouragementMessage}>{enc.message}</Text>
                <Text className={styles.encouragementTime}>{formatDate(enc.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className={styles.sendButton} onClick={handleSendEncouragement}>
          <Text className={styles.sendButtonText}>💬 鼓励同事</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AchievementsPage;
