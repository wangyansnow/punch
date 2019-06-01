// pages/feedList/feedList.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
const wy_date = require('../../utils/wy_date.js')

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
    this.feedList(1)
  },

  feedList: function (page) {
    const now = new Date()
    const timeOffset = now.getTimezoneOffset()
    wx.cloud.callFunction({
      name: 'feedList',
      data: {
        page: page
      }
    }).then(res => {
      var ds = []
      const count = res.result.fits.data.length
      var ids = []
      for (var i = 0; i < count; i++) {
        var item = res.result.fits.data[i]
        console.log(JSON.stringify(item))
        const date = new Date(item.createTime)
        item.time = wy_date.formatSimpleTime(date)
        ids.push(item._openid)
        ds.push(item)
      }
      this.setUserAvatar(ds, ids)
    }).catch(res => {
      console.log('weekDetail fail:' + res)
    })
  },



  setUserAvatar: function (ds2, ids) {

    wx.cloud.callFunction({
      name: 'getUser',
      data: {
        openIds: ids
      }
    }).then(res => {

      var users = res.result.users.data;
      
      const count = ds2.length
      for (var i = 0; i < count; i++) {
       var item = ds2[i];

        for(var j =0 ;j< users.length;j++){
          var user = users[j];
          if (item._openid == user.openId){
            item.avatar = user.userInfo.avatarUrl
            item.username = user.username
          }
        }
      }

      this.setData({
        dataSource: ds2
      })

   }).catch(res => {
    console.log('weekDetail fail:' + res)
  })
 },

searchAvatar:function(openId){


},









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