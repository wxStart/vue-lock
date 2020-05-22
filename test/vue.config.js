const webpack = require('webpack');

const getCustomEnv = () => ({});

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        // vue-cli中的设置会覆盖'process.env'
        'process.custom': getCustomEnv()
      })
    ]
  },
  chainWebpack: config => {
    // 移除prefetch插件
    config.plugins.delete('prefetch');
  }
};
