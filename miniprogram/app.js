//app.js
App({
  onLaunch: function (options) {
    console.log('options:'+JSON.stringify(options));
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    if (options.scene == 1044) { // 从群进来的
      this.globalData.shareTicket = options.shareTicket;
    }
    console.log('ticket:'+this.globalData.shareTicket)

    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      this.globalData.openId = res.result.openid;
    }).catch(res => {
      console.log('登录失败：' + JSON.stringify(res));
    })
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              // console.log('res:'+JSON.stringify(res))
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          console.log('没有授权')
        }
      }
    })
  },

  globalData: {
    userInfo: null,
    openId: null,
    username: '',
    shareTicket: null
  }
})
