import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { habitsData } from '@/data/habits';

const ActionDetailPage: React.FC = () => {
  const [habit, setHabit] = useState<any>(null);

  useEffect(() => {
    const { habitId } = Taro.getCurrentInstance().router?.params || {};
    if (habitId) {
      const foundHabit = habitsData.find(h => h.id === habitId);
      if (foundHabit) {
        setHabit(foundHabit);
      }
    }
  }, []);

  const handleStartHabit = () => {
    Taro.showToast({
      title: '开始执行习惯！',
      icon: 'success',
      duration: 2000
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 2000);
  };

  const handleAlternativePress = (altId: string) => {
    const altHabit = habitsData.find(h => h.id === altId);
    if (altHabit) {
      Taro.navigateTo({
        url: `/pages/action-detail/index?habitId=${altId}`
      });
    }
  };

  if (!habit) {
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
      <View className={styles.header}>
        <View className={styles.iconContainer}>
          <Text>{habit.icon}</Text>
        </View>
        <Text className={styles.habitName}>{habit.name}</Text>
        <Text className={styles.habitDescription}>{habit.description}</Text>
        <View className={styles.habitMeta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>约{habit.duration}</Text>
            <Text className={styles.metaLabel}>分钟/次</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{habit.frequency}</Text>
            <Text className={styles.metaLabel}>次/天</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          <Text>执行步骤</Text>
        </View>
        <View className={styles.stepList}>
          {habit.steps.map((step: string, idx: number) => (
            <View key={idx} className={styles.stepItem}>
              <View className={styles.stepNumber}>
                <Text>{idx + 1}</Text>
              </View>
              <Text className={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⚠️</Text>
          <Text>注意事项</Text>
        </View>
        <View className={styles.precautionList}>
          {habit.precautions.map((precaution: string, idx: number) => (
            <Text key={idx} className={styles.precautionItem}>
              {precaution}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🔄</Text>
          <Text>替代动作</Text>
        </View>
        <View className={styles.alternativeList}>
          {habit.alternatives.map((alt: any) => (
            <View 
              key={alt.id} 
              className={styles.alternativeItem}
              onClick={() => handleAlternativePress(alt.id)}
            >
              <View className={styles.alternativeIcon}>
                <Text>{alt.icon}</Text>
              </View>
              <Text className={styles.alternativeName}>{alt.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.actionButton} onClick={handleStartHabit}>
        <Text className={styles.actionButtonText}>开始执行</Text>
      </View>
    </ScrollView>
  );
};

export default ActionDetailPage;
