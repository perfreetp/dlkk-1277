import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import HabitCard from '@/components/HabitCard';
import { habitsData, userHabitSettingsData } from '@/data/habits';
import { officeStatusData } from '@/data/statistics';
import { formatDate, getWeekDayName, isWorkday } from '@/utils/dateUtils';
import { getStorage } from '@/utils/storageUtils';

interface HabitWithSetting {
  habit: any;
  setting: any;
  nextReminder?: string;
}

const TodayPage: React.FC = () => {
  const [todayHabits, setTodayHabits] = useState<HabitWithSetting[]>([]);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalStreak, setTotalStreak] = useState(0);
  const [todayCompletion, setTodayCompletion] = useState(0);
  const [officeStatus, setOfficeStatus] = useState(officeStatusData);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = () => {
    const today = formatDate(new Date(), 'YYYY-MM-DD');
    const todayDay = new Date().getDay();
    const isWork = isWorkday(today);

    if (!isWork) {
      setTodayHabits([]);
      setTotalRemaining(0);
      setTotalStreak(0);
      setTodayCompletion(0);
      return;
    }

    const enabledHabits = userHabitSettingsData.filter(
      setting => setting.enabled && setting.workdays.includes(todayDay)
    );

    const habitsWithSettings: HabitWithSetting[] = enabledHabits.map(setting => {
      const habit = habitsData.find(h => h.id === setting.habitId);
      const remaining = setting.frequency - setting.completedToday;
      const nextTimeSlot = setting.timeSlots.find((_, idx) => idx >= setting.completedToday);

      return {
        habit: habit,
        setting: setting,
        nextReminder: nextTimeSlot || undefined
      };
    });

    setTodayHabits(habitsWithSettings);
    setTotalRemaining(habitsWithSettings.reduce((sum, h) => sum + (h.setting.frequency - h.setting.completedToday), 0));
    setTotalStreak(Math.max(...enabledHabits.map(s => s.streakDays), 0));
    setTodayCompletion(enabledHabits.reduce((sum, s) => sum + s.completedToday, 0));
  };

  const handleComplete = (habitId: string) => {
    Taro.showToast({
      title: '已完成打卡 🎉',
      icon: 'success',
      duration: 2000
    });

    setTodayHabits(prev => prev.map(h => {
      if (h.habit.id === habitId) {
        return {
          ...h,
          setting: {
            ...h.setting,
            completedToday: h.setting.completedToday + 1
          }
        };
      }
      return h;
    }));

    setTotalRemaining(prev => Math.max(0, prev - 1));
    setTodayCompletion(prev => prev + 1);
  };

  const handleSnooze = (habitId: string) => {
    Taro.showToast({
      title: '稍后提醒',
      icon: 'none',
      duration: 1500
    });
  };

  const handleSkip = (habitId: string) => {
    Taro.showModal({
      title: '确认跳过',
      content: '确定要跳过这个习惯吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已跳过',
            icon: 'none',
            duration: 1500
          });

          setTodayHabits(prev => prev.map(h => {
            if (h.habit.id === habitId) {
              return {
                ...h,
                setting: {
                  ...h.setting,
                  completedToday: h.setting.frequency
                }
              };
            }
            return h;
          }));

          setTotalRemaining(prev => Math.max(0, prev - 1));
        }
      }
    });
  };

  const handleHabitPress = (habitId: string) => {
    Taro.navigateTo({
      url: `/pages/action-detail/index?habitId=${habitId}`
    });
  };

  const handleAddHabit = () => {
    Taro.switchTab({
      url: '/pages/library/index'
    });
  };

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 ${getWeekDayName(today)}`;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.dateText}>{dateStr}</Text>
        <Text className={styles.title}>今日习惯</Text>
      </View>

      <View className={styles.statusCard}>
        <View className={styles.statusHeader}>
          <Text className={styles.statusTitle}>当前状态</Text>
          <View className={styles.statusBadge}>
            <Text className={styles.statusBadgeText}>
              {officeStatus.isWorking ? '工作中' : officeStatus.isOnLunchBreak ? '午休中' : '空闲'}
            </Text>
          </View>
        </View>
        <View className={styles.statusContent}>
          <Text className={styles.statusIcon}>
            {officeStatus.isInMeeting ? '📅' : officeStatus.isOnLunchBreak ? '🍽️' : '💼'}
          </Text>
          <View className={styles.statusInfo}>
            <Text className={styles.statusLabel}>
              {officeStatus.isInMeeting 
                ? '正在开会' 
                : officeStatus.isOnLunchBreak 
                  ? '午休时间' 
                  : '专注工作中'}
            </Text>
            <Text className={styles.statusDetail}>
              {officeStatus.nextMeetingTime 
                ? `下次会议: ${officeStatus.nextMeetingTime}` 
                : '暂无会议安排'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalRemaining}</Text>
            <Text className={styles.statLabel}>剩余次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayCompletion}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalStreak}</Text>
            <Text className={styles.statLabel}>连续天数</Text>
          </View>
        </View>
      </View>

      {todayHabits.length > 0 ? (
        <>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>待完成习惯</Text>
            <Text className={styles.sectionCount}>
              {todayHabits.filter(h => h.setting.completedToday < h.setting.frequency).length} 个
            </Text>
          </View>

          <View className={styles.habitList}>
            {todayHabits
              .filter(h => h.setting.completedToday < h.setting.frequency)
              .map(habitWithSetting => (
                <HabitCard
                  key={habitWithSetting.habit.id}
                  habit={habitWithSetting.habit}
                  setting={habitWithSetting.setting}
                  nextReminder={habitWithSetting.nextReminder}
                  onComplete={() => handleComplete(habitWithSetting.habit.id)}
                  onSnooze={() => handleSnooze(habitWithSetting.habit.id)}
                  onSkip={() => handleSkip(habitWithSetting.habit.id)}
                  onPress={() => handleHabitPress(habitWithSetting.habit.id)}
                />
              ))}
          </View>
        </>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎉</Text>
          <Text className={styles.emptyTitle}>今日习惯已全部完成！</Text>
          <Text className={styles.emptyText}>
            {isWorkday(today) ? '太棒了，明天继续加油！' : '周末愉快，好好休息！'}
          </Text>
          <View className={styles.addButton} onClick={handleAddHabit}>
            <Text className={styles.addButtonText}>添加新习惯</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default TodayPage;
