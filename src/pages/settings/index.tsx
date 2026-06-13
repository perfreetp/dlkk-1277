import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useHabits } from '@/store/habitStore';
import { weekDayNames } from '@/data/statistics';

const SettingsPage: React.FC = () => {
  const { 
    habits, 
    userHabits, 
    addUserHabit,
    removeUserHabit,
    updateUserHabit,
    appSettings,
    updateAppSettings,
    clearAllData
  } = useHabits();
  
  const [localSettings, setLocalSettings] = useState({
    isLunchBreakFree: true,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    isMeetingSkip: true
  });

  useEffect(() => {
    setLocalSettings({
      isLunchBreakFree: appSettings.isLunchBreakFree,
      lunchBreakStart: appSettings.lunchBreakStart,
      lunchBreakEnd: appSettings.lunchBreakEnd,
      isMeetingSkip: appSettings.isMeetingSkip
    });
  }, [appSettings]);

  const toggleHabitEnabled = (habitId: string) => {
    const setting = userHabits.find(s => s.habitId === habitId);
    if (setting) {
      updateUserHabit(habitId, { enabled: !setting.enabled });
    }
  };

  const toggleWorkday = (habitId: string, day: number) => {
    const setting = userHabits.find(s => s.habitId === habitId);
    if (setting) {
      const workdays = setting.workdays.includes(day)
        ? setting.workdays.filter(d => d !== day)
        : [...setting.workdays, day];
      updateUserHabit(habitId, { workdays: workdays.sort() });
    }
  };

  const updateFrequency = (habitId: string, delta: number) => {
    const setting = userHabits.find(s => s.habitId === habitId);
    if (setting) {
      const newFreq = Math.max(1, Math.min(12, setting.frequency + delta));
      updateUserHabit(habitId, { frequency: newFreq });
    }
  };

  const handleHabitPress = (habitId: string) => {
    Taro.navigateTo({
      url: `/pages/setting-detail/index?habitId=${habitId}`
    });
  };

  const toggleLunchBreakFree = () => {
    const newValue = !localSettings.isLunchBreakFree;
    setLocalSettings({ ...localSettings, isLunchBreakFree: newValue });
    updateAppSettings({ isLunchBreakFree: newValue });
  };

  const toggleMeetingSkip = () => {
    const newValue = !localSettings.isMeetingSkip;
    setLocalSettings({ ...localSettings, isMeetingSkip: newValue });
    updateAppSettings({ isMeetingSkip: newValue });
  };

  const handleTimeSetting = (type: 'lunchStart' | 'lunchEnd') => {
    const currentValue = type === 'lunchStart' ? localSettings.lunchBreakStart : localSettings.lunchBreakEnd;
    
    Taro.showModal({
      title: `设置${type === 'lunchStart' ? '午休开始' : '午休结束'}时间`,
      editable: true,
      placeholderText: '格式: HH:mm，如 12:00',
      success: (res) => {
        if (res.confirm && res.content) {
          const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
          if (timeRegex.test(res.content)) {
            const newSettings = {
              ...localSettings,
              [type === 'lunchStart' ? 'lunchBreakStart' : 'lunchBreakEnd']: res.content
            };
            setLocalSettings(newSettings);
            updateAppSettings(newSettings);
            Taro.showToast({
              title: '时间已更新',
              icon: 'success',
              duration: 1500
            });
          } else {
            Taro.showToast({
              title: '时间格式错误',
              icon: 'none',
              duration: 1500
            });
          }
        }
      }
    });
  };

  const handleClearData = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？此操作不可恢复！\n包括：\n• 已添加的习惯\n• 所有打卡记录\n• 提醒设置\n• 成就数据',
      confirmText: '确定清空',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          clearAllData();
          Taro.showToast({
            title: '数据已清空',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  };

  const getHabitIcon = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.icon || '❓';
  };

  const getHabitName = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.name || '未知习惯';
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>习惯提醒</Text>
        </View>

        {userHabits.map(habit => (
          <View 
            key={habit.habitId} 
            className={styles.habitItem}
            onClick={() => handleHabitPress(habit.habitId)}
          >
            <View className={styles.habitIcon}>
              <Text>{getHabitIcon(habit.habitId)}</Text>
            </View>
            <View className={styles.habitInfo}>
              <Text className={styles.habitName}>{getHabitName(habit.habitId)}</Text>
              <Text className={styles.habitSettings}>
                每天 {habit.frequency} 次 · {habit.workdays.length} 天/周
              </Text>
            </View>
            <Switch
              checked={habit.enabled}
              onChange={() => toggleHabitEnabled(habit.habitId)}
              onClick={(e: any) => e.stopPropagation()}
              activeColor="#10B981"
            />
          </View>
        ))}

        {userHabits.length === 0 && (
          <View className={styles.emptySection}>
            <Text className={styles.emptyText}>还没有添加任何习惯</Text>
            <View 
              className={styles.addButton}
              onClick={() => Taro.switchTab({ url: '/pages/library/index' })}
            >
              <Text className={styles.addButtonText}>去动作库添加</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>午休免打扰</Text>
        </View>
        <View className={styles.settingRow}>
          <Text className={styles.settingLabel}>启用午休免打扰</Text>
          <Switch
            checked={localSettings.isLunchBreakFree}
            onChange={toggleLunchBreakFree}
            activeColor="#10B981"
          />
        </View>
        <View className={styles.settingRow} onClick={() => handleTimeSetting('lunchStart')}>
          <Text className={styles.settingLabel}>午休开始时间</Text>
          <Text className={styles.settingValue}>{localSettings.lunchBreakStart}</Text>
        </View>
        <View className={styles.settingRow} onClick={() => handleTimeSetting('lunchEnd')}>
          <Text className={styles.settingLabel}>午休结束时间</Text>
          <Text className={styles.settingValue}>{localSettings.lunchBreakEnd}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>会议跳过</Text>
        </View>
        <View className={styles.settingRow}>
          <View>
            <Text className={styles.settingLabel}>会议期间自动跳过提醒</Text>
            <Text className={styles.settingHint}>开启后在今日页面点击"会议中"状态</Text>
          </View>
          <Switch
            checked={localSettings.isMeetingSkip}
            onChange={toggleMeetingSkip}
            activeColor="#10B981"
          />
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

      {userHabits.length > 0 && (
        <View className={styles.actionButton} onClick={() => Taro.switchTab({ url: '/pages/library/index' })}>
          <Text className={styles.actionButtonText}>添加新习惯</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default SettingsPage;
