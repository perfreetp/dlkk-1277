import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { badgesData, weeklyReportsData, encouragementsData } from '@/data/achievements';

const AchievementsPage: React.FC = () => {
  const [badges, setBadges] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [encouragements, setEncouragements] = useState<any[]>([]);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const unlockedBadges = badgesData.slice(0, 5).map((badge, idx) => ({
      ...badge,
      unlocked: idx < 3
    }));
    setBadges(unlockedBadges);

    setReports(weeklyReportsData);
    setEncouragements(encouragementsData);

    setTotalCheckIns(156);
    setLongestStreak(21);
    setCurrentStreak(12);
  };

  const handleSendEncouragement = () => {
    Taro.showToast({
      title: '鼓励功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  const getAvatarText = (name: string) => {
    return name.substring(0, 1);
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
                  来自 {enc.fromUserName} 的鼓励
                </Text>
                <Text className={styles.encouragementMessage}>{enc.message}</Text>
                <Text className={styles.encouragementTime}>{enc.createdAt}</Text>
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
