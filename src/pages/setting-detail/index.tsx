import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { habitsData, userHabitSettingsData } from '@/data/habits';
import { habitGroupsData, weekDayShortNames } from '@/data/statistics';

const SettingDetailPage: React.FC = () => {
  const [habit, setHabit] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [selectedWorkdays, setSelectedWorkdays] = useState<number[]>([]);
  const [frequency, setFrequency] = useState(4);
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    const { habitId } = Taro.getCurrentInstance().router?.params || {};
    if (habitId) {
      const foundHabit = habitsData.find(h => h.id === habitId);
      const foundSettings = userHabitSettingsData.find(s => s.habitId === habitId);
      
      if (foundHabit && foundSettings) {
        setHabit(foundHabit);
        setSettings(foundSettings);
        setSelectedWorkdays(foundSettings.workdays);
        setFrequency(foundSettings.frequency);
        setSelectedGroup(foundSettings.group || '');
      }
    }
  }, []);

  const toggleWorkday = (day: number) => {
    setSelectedWorkdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const updateFrequency = (delta: number) => {
    setFrequency(prev => Math.max(1, Math.min(12, prev + delta)));
  };

  const handleSave = () => {
    Taro.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 2000);
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个习惯吗？',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已删除',
            icon: 'success',
            duration: 2000
          });

          setTimeout(() => {
            Taro.navigateBack();
          }, 2000);
        }
      }
    });
  };

  if (!habit || !settings) {
    return (
      <View className={styles.page}>
        <View className={styles.section}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.habitInfo}>
        <View className={styles.habitIcon}>
          <Text>{habit.icon}</Text>
        </View>
        <View className={styles.habitDetails}>
          <Text className={styles.habitName}>{habit.name}</Text>
          <Text className={styles.habitDescription}>{habit.description}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>提醒频次</Text>
        <View className={styles.settingRow}>
          <Text className={styles.settingLabel}>每日提醒次数</Text>
          <View className={styles.frequencyControl}>
            <View 
              className={styles.frequencyButton}
              onClick={() => updateFrequency(-1)}
            >
              <Text>−</Text>
            </View>
            <Text className={styles.frequencyValue}>{frequency}</Text>
            <View 
              className={styles.frequencyButton}
              onClick={() => updateFrequency(1)}
            >
              <Text>+</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>工作日设置</Text>
        <View className={styles.settingRow}>
          <Text className={styles.settingLabel}>选择提醒日</Text>
          <View className={styles.weekdayPicker}>
            {weekDayShortNames.map((day, idx) => (
              <View
                key={idx}
                className={`${styles.weekdayItem} ${selectedWorkdays.includes(idx) ? styles.active : ''}`}
                onClick={() => toggleWorkday(idx)}
              >
                <Text>{day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>提醒时段</Text>
        <View className={styles.timeSlotList}>
          {settings.timeSlots.map((time: string, idx: number) => (
            <View key={idx} className={styles.timeSlotItem}>
              <Text className={styles.timeSlotLabel}>时段 {idx + 1}</Text>
              <Text className={styles.timeSlotTime}>{time}</Text>
            </View>
          ))}
        </View>
        <View className={styles.addTimeButton}>
          <Text className={styles.addTimeText}>+ 添加时段</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>习惯分组</Text>
        <View className={styles.groupSelector}>
          {habitGroupsData.map(group => (
            <View
              key={group.id}
              className={`${styles.groupItem} ${selectedGroup === group.name ? styles.active : ''}`}
              onClick={() => setSelectedGroup(group.name)}
            >
              <Text>{group.icon}</Text>
              <Text>{group.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.saveButton} onClick={handleSave}>
        <Text className={styles.saveButtonText}>保存设置</Text>
      </View>

      <View className={styles.deleteButton} onClick={handleDelete}>
        <Text className={styles.deleteButtonText}>删除此习惯</Text>
      </View>
    </ScrollView>
  );
};

export default SettingDetailPage;
