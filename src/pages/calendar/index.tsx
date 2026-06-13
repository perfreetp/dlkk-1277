import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useHabits } from '@/store/habitStore';
import { getMonthDays, getFirstDayOfMonth, formatDate } from '@/utils/dateUtils';

interface CalendarDay {
  date: string;
  day: number;
  rate: number;
  status: 'completed' | 'partial' | 'missed' | 'empty' | 'future';
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarPage: React.FC = () => {
  const { checkInRecords, habits, userHabits } = useHabits();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [monthStats, setMonthStats] = useState({
    totalDays: 0,
    completedDays: 0,
    averageRate: 0,
    longestStreak: 0
  });
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    generateCalendar();
  }, [currentYear, currentMonth, checkInRecords]);

  useEffect(() => {
    calculateStats();
    loadRecentRecords();
  }, [calendarDays]);

  const generateCalendar = () => {
    const days = getMonthDays(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = formatDate(new Date(), 'YYYY-MM-DD');

    const calendar: CalendarDay[] = [];

    for (let i = 0; i < firstDay; i++) {
      calendar.push({ date: '', day: 0, rate: 0, status: 'empty' });
    }

    days.forEach(date => {
      const dayNum = parseInt(date.split('-')[2]);
      const dayRecords = checkInRecords.filter(r => r.date === date && r.status === 'completed');
      const totalHabits = userHabits.length;
      
      let status: CalendarDay['status'] = 'empty';
      let rate = 0;
      
      if (date > today) {
        status = 'future';
      } else if (totalHabits > 0) {
        rate = Math.round((dayRecords.length / totalHabits) * 100);
        
        if (rate >= 90) {
          status = 'completed';
        } else if (rate >= 50) {
          status = 'partial';
        } else if (dayRecords.length > 0) {
          status = 'missed';
        }
      }

      calendar.push({
        date,
        day: dayNum,
        rate,
        status
      });
    });

    setCalendarDays(calendar);
  };

  const calculateStats = () => {
    const completedDays = calendarDays.filter(d => d.status === 'completed').length;
    const totalRate = calendarDays.reduce((sum, d) => sum + (d.rate || 0), 0);
    const validDays = calendarDays.filter(d => d.status !== 'empty' && d.status !== 'future').length;

    const streak = calculateLongestStreak();

    setMonthStats({
      totalDays: validDays,
      completedDays,
      averageRate: validDays > 0 ? Math.round(totalRate / validDays) : 0,
      longestStreak: streak
    });
  };

  const calculateLongestStreak = () => {
    if (calendarDays.length === 0) return 0;
    
    let longestStreak = 0;
    let currentStreak = 0;
    
    const sortedDays = calendarDays
      .filter(d => d.date && d.status !== 'empty' && d.status !== 'future')
      .sort((a, b) => a.date.localeCompare(b.date));
    
    for (let i = 0; i < sortedDays.length; i++) {
      if (sortedDays[i].status === 'completed') {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  };

  const loadRecentRecords = () => {
    const today = formatDate(new Date(), 'YYYY-MM-DD');
    const yesterday = formatDate(new Date(Date.now() - 86400000), 'YYYY-MM-DD');
    
    const recent = checkInRecords
      .filter(r => r.date === today || r.date === yesterday)
      .sort((a, b) => {
        const timeA = a.completedAt || '';
        const timeB = b.completedAt || '';
        return timeB.localeCompare(timeA);
      });
    
    const recordsWithHabits = recent.map(record => {
      const habit = habits.find(h => h.id === record.habitId);
      return {
        ...record,
        habitName: habit?.name || '未知习惯',
        habitIcon: habit?.icon || '❓'
      };
    });

    setRecentRecords(recordsWithHabits.slice(0, 5));
  };

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDayStatusText = (status: string, rate: number) => {
    if (status === 'completed') return '✓';
    if (status === 'partial') return `${Math.round(rate)}%`;
    if (status === 'missed') return '✗';
    return '';
  };

  const getRecordStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'skipped':
        return '已跳过';
      case 'snoozed':
        return '稍后提醒';
      case 'unsuitable':
        return '不适合';
      default:
        return status;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.monthSelector}>
          <View className={styles.monthButton} onClick={goToPrevMonth}>
            <Text>‹</Text>
          </View>
          <Text className={styles.monthText}>
            {currentYear}年{currentMonth}月
          </Text>
          <View className={styles.monthButton} onClick={goToNextMonth}>
            <Text>›</Text>
          </View>
        </View>

        <View className={styles.weekDays}>
          {weekDays.map(day => (
            <View key={day} className={styles.weekDayItem}>
              <Text>{day}</Text>
            </View>
          ))}
        </View>

        <View className={styles.calendarGrid}>
          {calendarDays.map((day, idx) => (
            <View 
              key={idx} 
              className={`
                ${styles.calendarDay} 
                ${day.status === 'completed' ? styles.completed : ''}
                ${day.status === 'partial' ? styles.partial : ''}
                ${day.status === 'missed' ? styles.missed : ''}
                ${day.status === 'empty' ? styles.empty : ''}
                ${day.date === formatDate(new Date(), 'YYYY-MM-DD') ? styles.today : ''}
              `}
            >
              {day.day > 0 && (
                <>
                  <Text className={styles.dayText}>{day.day}</Text>
                  {day.status !== 'empty' && day.status !== 'future' && (
                    <Text className={styles.dayRate}>
                      {getDayStatusText(day.status, day.rate)}
                    </Text>
                  )}
                </>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.statsSection}>
        <Text className={styles.sectionTitle}>本月统计</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{monthStats.completedDays}</Text>
            <Text className={styles.statLabel}>完成天数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{monthStats.averageRate}%</Text>
            <Text className={styles.statLabel}>平均完成率</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{monthStats.totalDays}</Text>
            <Text className={styles.statLabel}>总打卡天数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{monthStats.longestStreak}</Text>
            <Text className={styles.statLabel}>最长连续</Text>
          </View>
        </View>

        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.completed}`} />
            <Text className={styles.legendText}>完成 ≥90%</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.partial}`} />
            <Text className={styles.legendText}>部分 50-90%</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.missed}`} />
            <Text className={styles.legendText}>未完成 <50%</Text>
          </View>
        </View>
      </View>

      <View className={styles.recordsSection}>
        <Text className={styles.sectionTitle}>最近打卡记录</Text>
        {recentRecords.length > 0 ? (
          recentRecords.map((record, idx) => (
            <View key={idx} className={styles.recordItem}>
              <View className={`${styles.recordIcon} ${styles[record.status]}`}>
                <Text>{record.habitIcon}</Text>
              </View>
              <View className={styles.recordInfo}>
                <Text className={styles.recordName}>{record.habitName}</Text>
                <Text className={styles.recordTime}>
                  {record.date} · {record.completedAt?.split('T')[1]?.substring(0, 5) || record.skipReason || '未知时间'}
                </Text>
              </View>
              <View className={`${styles.recordStatus} ${styles[record.status]}`}>
                <Text>{getRecordStatusText(record.status)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyRecords}>
            <Text className={styles.emptyText}>暂无打卡记录</Text>
            <Text className={styles.emptyHint}>完成习惯后会在此显示</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CalendarPage;
