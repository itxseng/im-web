const path = require('path')
const fs = require('fs')
function resolve (dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  // // 静态资源文件路径
  // publicPath: './',
  // // 打包文件目录
  // outputDir: 'dist',
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        productName: 'NEW-IM', // 应用名称
        appId: 'com.example.new-im',
        win: {
          icon: 'public/logo.ico',
          // 打包权限 asInvoker | highestAvailable
          requestedExecutionLevel: 'highestAvailable'
        }
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        // eslint-disable-next-line no-undef
        '@': resolve('src'),
      },
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_PROXY,
        changeOrigin: true,
        ws: false,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}