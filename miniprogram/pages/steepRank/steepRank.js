// pages/steepRank/steepRank.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          console.log('登录success！' + JSON.stringify(res))
          wx.getWeRunData({
            success: function (res) {
              console.log(JSON.stringify(res));
              // console.log("appid:" + appid + "session_key:" + session_key + "encryptedData:" + res.encryptedData + "iv:" + res.iv);
              var encryptedData = res.encryptedData;
              var iv = res.iv;
              // //使用解密工具，链接地址：
              // //https://codeload.github.com/gwjjeff/cryptojs/zip/master
              var pc = new WXBizDataCrypt(appid, session_key);
              console.log(pc);
              // var data = pc.decryptData(encryptedData, iv)
              // console.log(data)
            },
            fail: function (res) {
              wx.showModal({
                title: '提示',
                content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
                showCancel: false,
                confirmText: '知道了'
              })
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  // getUserRunCount: function(){
  //   wx.getWeRunData({
  //     success: function (res) {
  //       // console.log(res);
  //       // console.log("appid:" + appid + "session_key:" + session_key + "encryptedData:" + res.encryptedData + "iv:" + res.iv);
  //       // var encryptedData = res.encryptedData;
  //       // var iv = res.iv;
  //       // //使用解密工具，链接地址：
  //       // //https://codeload.github.com/gwjjeff/cryptojs/zip/master
  //       // var pc = new WXBizDataCrypt(appid, session_key);
  //       // console.log(pc);
  //       // var data = pc.decryptData(encryptedData, iv)
  //       // console.log(data)
  //     },
  //     fail: function (res) {
  //       // wx.showModal({
  //       //   title: '提示',
  //       //   content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
  //       //   showCancel: false,
  //       //   confirmText: '知道了'
  //       // })
  //     }
  //   })
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})