export default defineAppConfig({
  pages: [
    'pages/today/index',
    'pages/settings/index',
    'pages/library/index',
    'pages/calendar/index',
    'pages/achievements/index',
    'pages/action-detail/index',
    'pages/setting-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4F46E5',
    navigationBarTitleText: '微习惯养成',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/today/index',
        text: '今日'
      },
      {
        pagePath: 'pages/settings/index',
        text: '提醒'
      },
      {
        pagePath: 'pages/library/index',
        text: '动作库'
      },
      {
        pagePath: 'pages/calendar/index',
        text: '日历'
      },
      {
        pagePath: 'pages/achievements/index',
        text: '成就'
      }
    ]
  }
})
