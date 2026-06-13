import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import HabitCard from '@/components/HabitCard';
import { useHabits } from '@/store/habitStore';
import { formatDate, getWeekDayName, isWorkday } from '@/utils/dateUtils';

const TodayPage: React.FC = () => {
  const { 
    getTodayHabits, 
    completeHabit, 
    snoozeHabit, 
    skipHabit, 
    appSettings,
    updateAppSettings,
    getSettingById
  } = useHabits();
  
  const [todayHabits, setTodayHabits] = useState<any[]>([]);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalStreak, setTotalStreak] = useState(0);
  const [todayCompletion, setTodayCompletion] = useState(0);
  const [officeStatus, setOfficeStatus] = useState({
    isInMeeting: false,
    isOnLunchBreak: false,
    isWorking: true,
    nextMeetingTime: ''
  });

  useEffect(() => {
    loadTodayData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      checkCurrentStatus();
      loadTodayData();
    }, 60000);
    
    return () => clearInterval(timer);
  }, [appSettings]);

  const checkCurrentStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
    
    const lunchStart = appSettings.lunchBreakStart || '12:00';
    const lunchEnd = appSettings.lunchBreakEnd || '13:00';
    
    const isOnLunchBreak = appSettings.isLunchBreakFree && 
      currentTime >= lunchStart && currentTime < lunchEnd;
    
    setOfficeStatus({
      isInMeeting: appSettings.isInMeeting || false,
      isOnLunchBreak,
      isWorking: !isOnLunchBreak && !(appSettings.isInMeeting || false),
      nextMeetingTime: '14:00'
    });
  };

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

    const habits = getTodayHabits();
    setTodayHabits(habits);
    
    const remaining = habits.reduce((sum, h) => sum + (h.setting.frequency - h.setting.completedToday), 0);
    const completion = habits.reduce((sum, h) => sum + h.setting.completedToday, 0);
    const maxStreak = Math.max(...habits.map(h => h.setting.streakDays), 0);
    
    setTotalRemaining(remaining);
    setTotalStreak(maxStreak);
    setTodayCompletion(completion);
    
    checkCurrentStatus();
  };

  const handleComplete = (habitId: string) => {
    completeHabit(habitId);
    
    Taro.showToast({
      title: '已完成打卡 🎉',
      icon: 'success',
      duration: 2000
    });

    setTimeout(() => {
      loadTodayData();
    }, 100);
  };

  const handleSnooze = (habitId: string) => {
    snoozeHabit(habitId);
    
    Taro.showToast({
      title: '稍后提醒',
      icon: 'none',
      duration: 1500
    });

    setTimeout(() => {
      loadTodayData();
    }, 100);
  };

  const handleSkip = (habitId: string) => {
    Taro.showActionSheet({
      itemList: ['临时会议', '不适合当前', '其他原因', '取消'],
      success: (res) => {
        if (res.tapIndex < 3) {
          const reasons = ['meeting', 'unsuitable', 'other'];
          skipHabit(habitId, reasons[res.tapIndex]);
          
          Taro.showToast({
            title: '已记录',
            icon: 'none',
            duration: 1500
          });

          setTimeout(() => {
            loadTodayData();
          }, 100);
        }
      }
    });
  };

  const handleMeetingToggle = () => {
    updateAppSettings({ isInMeeting: !appSettings.isInMeeting });
    
    Taro.showToast({
      title: appSettings.isInMeeting ? '已取消会议模式' : '已开启会议模式',
      icon: 'none',
      duration: 1500
    });

    setTimeout(() => {
      loadTodayData();
    }, 100);
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
          <View 
            className={`${styles.statusBadge} ${officeStatus.isInMeeting ? styles.meeting : ''}`}
            onClick={handleMeetingToggle}
          >
            <Text className={styles.statusBadgeText}>
              {officeStatus.isInMeeting ? '会议中' : officeStatus.isOnLunchBreak ? '午休中' : '工作中'}
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
                ? '正在开会，提醒已自动跳过' 
                : officeStatus.isOnLunchBreak 
                  ? '午休时间，享受休息时光' 
                  : '专注工作中，保持健康'}
            </Text>
            <Text className={styles.statusDetail}>
              {officeStatus.isInMeeting && appSettings.isMeetingSkip 
                ? '会议跳过已启用' 
                : officeStatus.nextMeetingTime 
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
              .filter(h => {
                if (appSettings.isInMeeting && appSettings.isMeetingSkip) {
                  return false;
                }
                if (appSettings.isLunchBreakFree && officeStatus.isOnLunchBreak) {
                  return false;
                }
                return h.setting.completedToday < h.setting.frequency;
              })
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
          
          {todayHabits.filter(h => h.setting.completedToday < h.setting.frequency).length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🎉</Text>
              <Text className={styles.emptyTitle}>
                {officeStatus.isInMeeting && appSettings.isMeetingSkip 
                  ? '会议期间提醒已跳过' 
                  : officeStatus.isOnLunchBreak && appSettings.isLunchBreakFree 
                    ? '午休时间好好休息' 
                    : '今日习惯已全部完成！'}
              </Text>
              <Text className={styles.emptyText}>
                {isWorkday(today) ? '太棒了，明天继续加油！' : '周末愉快，好好休息！'}
              </Text>
              <View className={styles.addButton} onClick={handleAddHabit}>
                <Text className={styles.addButtonText}>添加新习惯</Text>
              </View>
            </View>
          )}
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
