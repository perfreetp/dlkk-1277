import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    icon: string;
    description: string;
    duration: number;
  };
  setting: {
    completedToday: number;
    frequency: number;
    streakDays: number;
  };
  nextReminder?: string;
  onComplete?: () => void;
  onSnooze?: () => void;
  onSkip?: () => void;
  onPress?: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  setting,
  nextReminder,
  onComplete,
  onSnooze,
  onSkip,
  onPress
}) => {
  const progress = (setting.completedToday / setting.frequency) * 100;

  const handleComplete = (e: any) => {
    e.stopPropagation();
    onComplete?.();
  };

  const handleSnooze = (e: any) => {
    e.stopPropagation();
    onSnooze?.();
  };

  const handleSkip = (e: any) => {
    e.stopPropagation();
    onSkip?.();
  };

  return (
    <View className={styles.card} onClick={onPress}>
      <View className={styles.header}>
        <View className={styles.iconContainer}>
          <Text className={styles.icon}>{habit.icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{habit.name}</Text>
          <Text className={styles.description}>{habit.description}</Text>
        </View>
        <View className={styles.streak}>
          <Text className={styles.streakNumber}>{setting.streakDays}</Text>
          <Text className={styles.streakLabel}>天连续</Text>
        </View>
      </View>

      <View className={styles.progress}>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progress}%` }}></View>
        </View>
        <Text className={styles.progressText}>
          {setting.completedToday}/{setting.frequency}
        </Text>
      </View>

      {nextReminder && (
        <View className={styles.nextReminder}>
          <Text className={styles.reminderLabel}>下次提醒：</Text>
          <Text className={styles.reminderTime}>{nextReminder}</Text>
        </View>
      )}

      <View className={styles.actions}>
        <View className={styles.actionButton} onClick={handleComplete}>
          <Text className={styles.actionText}>✓ 完成</Text>
        </View>
        <View className={styles.secondaryButton} onClick={handleSnooze}>
          <Text className={styles.secondaryText}>稍后</Text>
        </View>
        <View className={styles.secondaryButton} onClick={handleSkip}>
          <Text className={styles.secondaryText}>跳过</Text>
        </View>
      </View>

      <View className={styles.duration}>
        <Text className={styles.durationText}>⏱️ 约{habit.duration}分钟</Text>
      </View>
    </View>
  );
};

export default HabitCard;
