import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { checkInRecordsData, dailyStatisticsData } from '@/data/habits';
import { getMonthDays, getFirstDayOfMonth, formatDate } from '@/utils/dateUtils';

interface CalendarDay {
  date: string;
  day: number;
  rate: number;
  status: 'completed' | 'partial' | 'missed' | 'empty' | 'future';
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarPage: React.FC = () => {
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
  }, [currentYear, currentMonth]);

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
      const stat = dailyStatisticsData.find(s => s.date === date);
      let status: CalendarDay['status'] = 'empty';
      
      if (date > today) {
        status = 'future';
      } else if (stat) {
        if (stat.completionRate >= 90) {
          status = 'completed';
        } else if (stat.completionRate >= 50) {
          status = 'partial';
        } else {
          status = 'missed';
        }
      }

      calendar.push({
        date,
        day: dayNum,
        rate: stat?.completionRate || 0,
        status
      });
    });

    setCalendarDays(calendar);
  };

  const calculateStats = () => {
    const completedDays = calendarDays.filter(d => d.status === 'completed').length;
    const totalRate = calendarDays.reduce((sum, d) => sum + (d.rate || 0), 0);
    const validDays = calendarDays.filter(d => d.status !== 'empty' && d.status !== 'future').length;

    setMonthStats({
      totalDays: validDays,
      completedDays,
      averageRate: validDays > 0 ? Math.round(totalRate / validDays) : 0,
      longestStreak: 12
    });
  };

  const loadRecentRecords = () => {
    const today = formatDate(new Date(), 'YYYY-MM-DD');
    const yesterday = formatDate(new Date(Date.now() - 86400000), 'YYYY-MM-DD');
    const recent = checkInRecordsData.filter(r => r.date === today || r.date === yesterday);
    
    const recordsWithHabits = recent.map(record => {
      const habit = habitsData.find(h => h.id === record.habitId);
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
        {recentRecords.map((record, idx) => (
          <View key={idx} className={styles.recordItem}>
            <View className={`${styles.recordIcon} ${styles[record.status]}`}>
              <Text>{record.habitIcon}</Text>
            </View>
            <View className={styles.recordInfo}>
              <Text className={styles.recordName}>{record.habitName}</Text>
              <Text className={styles.recordTime}>
                {record.date} · {record.completedAt?.split('T')[1].substring(0, 5) || record.skipReason}
              </Text>
            </View>
            <View className={`${styles.recordStatus} ${styles[record.status]}`}>
              <Text>
                {record.status === 'completed' ? '已完成' : 
                 record.status === 'skipped' ? '已跳过' : '不适合'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const habitsData = [
  { id: 'water-1', name: '喝水提醒', icon: '💧' },
  { id: 'stretch-1', name: '颈部拉伸', icon: '🧘' },
  { id: 'eye-1', name: '远眺休息', icon: '👀' },
  { id: 'stand-1', name: '站立活动', icon: '🧍' }
];

export default CalendarPage;
