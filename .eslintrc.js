module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 1.彻底解决eslint与webstorm针对vue的script标签缩进处理方式冲突问题
    'vue/script-indent': ['error', 2, { 'baseIndent': 1 }]
  },
  // 2.彻底解决eslint与webstorm针对vue的script标签缩进处理方式冲突问题
  overrides: [{
    'files': ['*.vue'],
    'rules': { 'indent': 'off' }
  }]
}
