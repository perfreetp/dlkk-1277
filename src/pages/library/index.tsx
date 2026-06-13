import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useHabits } from '@/store/habitStore';

const categories = [
  { id: 'all', name: '全部' },
  { id: 'water', name: '喝水' },
  { id: 'stretch', name: '拉伸' },
  { id: 'eye', name: '护眼' },
  { id: 'stand', name: '站立' },
  { id: 'walk', name: '走动' }
];

const LibraryPage: React.FC = () => {
  const { habits, userHabits, addUserHabit } = useHabits();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
  }, [userHabits]);

  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(h => h.category === selectedCategory);

  const handleHabitPress = (habitId: string) => {
    Taro.navigateTo({
      url: `/pages/action-detail/index?habitId=${habitId}`
    });
  };

  const handleAddHabit = (habitId: string, e: any) => {
    e.stopPropagation();
    
    if (userHabits.find(s => s.habitId === habitId)) {
      Taro.showToast({
        title: '已添加该习惯',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    Taro.showModal({
      title: '添加习惯',
      content: '确定要添加这个习惯到您的日常计划吗？',
      confirmText: '添加',
      success: (res) => {
        if (res.confirm) {
          addUserHabit(habitId);
          Taro.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>动作库</Text>
        <Text className={styles.headerSubtitle}>
          选择适合您的健康小动作
        </Text>
      </View>

      <ScrollView className={styles.categoryTabs} scrollX>
        {categories.map(cat => (
          <View
            key={cat.id}
            className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <Text>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <Text className={styles.sectionTitle}>
          {categories.find(c => c.id === selectedCategory)?.name || '全部'}动作
        </Text>

        <View className={styles.habitGrid}>
          {filteredHabits.map(habit => {
            const isAdded = userHabits.some(s => s.habitId === habit.id);
            
            return (
              <View 
                key={habit.id} 
                className={styles.habitCard}
                onClick={() => handleHabitPress(habit.id)}
              >
                <View className={styles.habitIcon}>
                  <Text>{habit.icon}</Text>
                </View>
                <Text className={styles.habitName}>{habit.name}</Text>
                <Text className={styles.habitDescription}>{habit.description}</Text>
                <View className={styles.habitMeta}>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaIcon}>⏱️</Text>
                    <Text className={styles.metaText}>约{habit.duration}分钟</Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaIcon}>📊</Text>
                    <Text className={styles.metaText}>每天{habit.frequency}次</Text>
                  </View>
                </View>

                {isAdded ? (
                  <View className={styles.addedBadge}>
                    <Text className={styles.addedText}>✓ 已添加</Text>
                  </View>
                ) : (
                  <View 
                    className={styles.addButton}
                    onClick={(e) => handleAddHabit(habit.id, e)}
                  >
                    <Text className={styles.addText}>+ 添加到我的习惯</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default LibraryPage;
