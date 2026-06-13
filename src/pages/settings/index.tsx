import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { habitsData, userHabitSettingsData } from '@/data/habits';
import { weekDayNames } from '@/data/statistics';
import { getStorage, saveAppSettings } from '@/utils/storageUtils';

interface HabitSetting {
  habitId: string;
  enabled: boolean;
  workdays: number[];
  timeSlots: string[];
  frequency: number;
}

const SettingsPage: React.FC = () => {
  const [habits, setHabits] = useState<any[]>([]);
  const [settings, setSettings] = useState<HabitSetting[]>([]);
  const [appSettings, setAppSettings] = useState({
    isLunchBreakFree: true,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    isMeetingSkip: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const habitsWithSettings = userHabitSettingsData.map(setting => {
      const habit = habitsData.find(h => h.id === setting.habitId);
      return {
        ...habit,
        setting: setting
      };
    });
    setHabits(habitsWithSettings);

    const loadedSettings = getStorage('appSettings');
    if (loadedSettings) {
      setAppSettings(loadedSettings);
    }
  };

  const toggleHabitEnabled = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          setting: {
            ...h.setting,
            enabled: !h.setting.enabled
          }
        };
      }
      return h;
    }));
  };

  const toggleWorkday = (habitId: string, day: number) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const workdays = h.setting.workdays.includes(day)
          ? h.setting.workdays.filter(d => d !== day)
          : [...h.setting.workdays, day];
        return {
          ...h,
          setting: {
            ...h.setting,
            workdays: workdays.sort()
          }
        };
      }
      return h;
    }));
  };

  const updateFrequency = (habitId: string, delta: number) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const newFreq = Math.max(1, Math.min(12, h.setting.frequency + delta));
        return {
          ...h,
          setting: {
            ...h.setting,
            frequency: newFreq
          }
        };
      }
      return h;
    }));
  };

  const handleHabitPress = (habitId: string) => {
    Taro.navigateTo({
      url: `/pages/setting-detail/index?habitId=${habitId}`
    });
  };

  const toggleLunchBreakFree = () => {
    const newSettings = { ...appSettings, isLunchBreakFree: !appSettings.isLunchBreakFree };
    setAppSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const toggleMeetingSkip = () => {
    const newSettings = { ...appSettings, isMeetingSkip: !appSettings.isMeetingSkip };
    setAppSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const handleClearData = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？此操作不可恢复！',
      confirmText: '确定清空',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorageSync();
          Taro.showToast({
            title: '数据已清空',
            icon: 'success',
            duration: 2000
          });
          loadData();
        }
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>习惯提醒</Text>
        </View>

        {habits.map(habit => (
          <View 
            key={habit.id} 
            className={styles.habitItem}
            onClick={() => handleHabitPress(habit.id)}
          >
            <View className={styles.habitIcon}>
              <Text>{habit.icon}</Text>
            </View>
            <View className={styles.habitInfo}>
              <Text className={styles.habitName}>{habit.name}</Text>
              <Text className={styles.habitSettings}>
                每天 {habit.setting.frequency} 次 · {habit.setting.timeSlots.length} 个时段
              </Text>
            </View>
            <Switch
              checked={habit.setting.enabled}
              onChange={() => toggleHabitEnabled(habit.id)}
              activeColor="#10B981"
            />
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>午休免打扰</Text>
        </View>
        <View className={styles.settingRow}>
          <Text className={styles.settingLabel}>启用午休免打扰</Text>
          <View 
            className={`${styles.toggleSwitch} ${appSettings.isLunchBreakFree ? styles.active : ''}`}
            onClick={toggleLunchBreakFree}
          >
            <View className={`${styles.toggleDot} ${appSettings.isLunchBreakFree ? styles.active : ''}`} />
          </View>
        </View>
        <View className={styles.settingRow}>
          <Text className={styles.settingLabel}>午休时间段</Text>
          <Text className={styles.settingValue}>
            {appSettings.lunchBreakStart} - {appSettings.lunchBreakEnd}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>会议跳过</Text>
        </View>
        <View className={styles.settingRow}>
          <Text className={styles.settingLabel}>会议期间自动跳过提醒</Text>
          <View 
            className={`${styles.toggleSwitch} ${appSettings.isMeetingSkip ? styles.active : ''}`}
            onClick={toggleMeetingSkip}
          >
            <View className={`${styles.toggleDot} ${appSettings.isMeetingSkip ? styles.active : ''}`} />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>数据管理</Text>
        </View>
        <View className={styles.settingRow} onClick={handleClearData}>
          <Text className={styles.settingLabel} style={{ color: '#EF4444' }}>
            清空所有数据
          </Text>
          <Text className={styles.settingValue}>›</Text>
        </View>
      </View>

      <View className={styles.actionButton} onClick={() => Taro.switchTab({ url: '/pages/library/index' })}>
        <Text className={styles.actionButtonText}>添加新习惯</Text>
      </View>
    </ScrollView>
  );
};

export default SettingsPage;
