import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  text?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  size = 200,
  strokeWidth = 12,
  color = '#4F46E5',
  backgroundColor = '#E2E8F0',
  showText = true,
  text = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <View className={styles.container} style={{ width: `${size}rpx`, height: `${size}rpx` }}>
      <View className={styles.svgContainer}>
        <View 
          className={styles.backgroundCircle}
          style={{
            width: `${size}rpx`,
            height: `${size}rpx`,
            borderRadius: `${size / 2}rpx`,
            border: `${strokeWidth}rpx solid ${backgroundColor}`
          }}
        />
        <View 
          className={styles.progressCircle}
          style={{
            width: `${size}rpx`,
            height: `${size}rpx`,
            borderRadius: `${size / 2}rpx`,
            border: `${strokeWidth}rpx solid ${color}`,
            borderRightColor: percent < 25 ? 'transparent' : color,
            borderBottomColor: percent < 50 ? 'transparent' : color,
            borderLeftColor: percent < 75 ? 'transparent' : color,
            transform: `rotate(${((percent / 100) * 360) - 90}deg)`
          }}
        />
      </View>
      {showText && (
        <View className={styles.textContainer}>
          <Text className={styles.percentText}>{Math.round(percent)}%</Text>
          {text && <Text className={styles.labelText}>{text}</Text>}
        </View>
      )}
    </View>
  );
};

export default ProgressRing;
