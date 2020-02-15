// 项目发布阶段需要用到的 babel 插件
const prodPlugins = []
// 如果项目是发布阶段
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布项目时候的插件数组
    ...prodPlugins
  ]
}
