import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { HabitProvider } from '@/store/habitStore';
import './app.scss';

function App(props) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return (
    <HabitProvider>
      {props.children}
    </HabitProvider>
  );
}

export default App;
