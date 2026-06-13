import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useHabits } from '@/store/habitStore';
import { habitGroupsData, weekDayShortNames } from '@/data/statistics';

const SettingDetailPage: React.FC = () => {
  const { 
    habits, 
    getSettingById, 
    updateUserHabit, 
    removeTimeSlot, 
    addTimeSlot,
    removeUserHabit 
  } = useHabits();
  
  const [habitId, setHabitId] = useState('');
  const [habit, setHabit] = useState<any>(null);
  const [setting, setSetting] = useState<any>(null);
  const [selectedWorkdays, setSelectedWorkdays] = useState<number[]>([]);
  const [frequency, setFrequency] = useState(4);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const { habitId: id } = Taro.getCurrentInstance().router?.params || {};
    if (id) {
      setHabitId(id);
      const foundHabit = habits.find(h => h.id === id);
      const foundSetting = getSettingById(id);
      
      if (foundHabit && foundSetting) {
        setHabit(foundHabit);
        setSetting(foundSetting);
        setSelectedWorkdays(foundSetting.workdays);
        setFrequency(foundSetting.frequency);
        setSelectedGroup(foundSetting.group || '');
        setTimeSlots(foundSetting.timeSlots);
        setDuration(foundSetting.duration || foundHabit.duration);
      }
    }
  }, [habitId]);

  const toggleWorkday = (day: number) => {
    const workdays = selectedWorkdays.includes(day) 
      ? selectedWorkdays.filter(d => d !== day)
      : [...selectedWorkdays, day];
    setSelectedWorkdays(workdays.sort());
    updateUserHabit(habitId, { workdays: workdays.sort() });
  };

  const updateFrequency = (delta: number) => {
    const newFreq = Math.max(1, Math.min(12, frequency + delta));
    setFrequency(newFreq);
    updateUserHabit(habitId, { frequency: newFreq });
  };

  const handleDurationChange = () => {
    Taro.showModal({
      title: '修改每次耗时',
      editable: true,
      placeholderText: '请输入分钟数',
      defaultValue: duration.toString(),
      success: (res) => {
        if (res.confirm && res.content) {
          const newDuration = parseInt(res.content);
          if (!isNaN(newDuration) && newDuration > 0 && newDuration <= 60) {
            setDuration(newDuration);
            updateUserHabit(habitId, { duration: newDuration });
            Taro.showToast({
              title: '耗时已修改',
              icon: 'success',
              duration: 1500
            });
          } else {
            Taro.showToast({
              title: '请输入1-60的数字',
              icon: 'none',
              duration: 1500
            });
          }
        }
      }
    });
  };

  const handleAddTimeSlot = () => {
    Taro.showModal({
      title: '添加时段',
      editable: true,
      placeholderText: '格式: HH:mm，如 10:30',
      success: (res) => {
        if (res.confirm && res.content) {
          const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
          if (timeRegex.test(res.content)) {
            const newSlots = [...timeSlots, res.content].sort();
            setTimeSlots(newSlots);
            updateUserHabit(habitId, { timeSlots: newSlots });
            Taro.showToast({
              title: '时段已添加',
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

  const handleRemoveTimeSlot = (index: number) => {
    Taro.showModal({
      title: '删除时段',
      content: '确定要删除这个提醒时段吗？',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          const newSlots = timeSlots.filter((_, i) => i !== index);
          setTimeSlots(newSlots);
          updateUserHabit(habitId, { timeSlots: newSlots });
          Taro.showToast({
            title: '时段已删除',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  };

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
    updateUserHabit(habitId, { group: groupName });
  };

  const handleSave = () => {
    Taro.showToast({
      title: '设置已保存',
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
      content: '确定要删除这个习惯吗？\n删除后可以在动作库中重新添加。',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          removeUserHabit(habitId);
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

  if (!habit || !setting) {
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
        <View className={styles.settingRow} onClick={handleDurationChange}>
          <Text className={styles.settingLabel}>每次耗时</Text>
          <View className={styles.durationValue}>
            <Text>约{duration}分钟</Text>
            <Text className={styles.editIcon}>✎</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>工作日设置</Text>
        <View className={styles.settingRow}>
          <Text className={styles.settingLabel}>选择提醒日</Text>
        </View>
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

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>提醒时段</Text>
        <View className={styles.timeSlotList}>
          {timeSlots.map((time, idx) => (
            <View 
              key={idx} 
              className={styles.timeSlotItem}
              onClick={() => handleRemoveTimeSlot(idx)}
            >
              <Text className={styles.timeSlotLabel}>时段 {idx + 1}</Text>
              <Text className={styles.timeSlotTime}>{time}</Text>
              <Text className={styles.deleteIcon}>✕</Text>
            </View>
          ))}
        </View>
        <View className={styles.addTimeButton} onClick={handleAddTimeSlot}>
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
              onClick={() => handleGroupSelect(group.name)}
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
