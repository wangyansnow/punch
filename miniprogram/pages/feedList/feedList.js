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
    this.feedList(0)
  },

  feedList: function (page) {
    wx.showLoading({
      title: '数据加载中...',
    })

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
      var users = res.result.users.data;
     
      for (var i = 0; i < count; i++) {
        var item = res.result.fits.data[i]
        const date = new Date(item.createTime)
        item.time = wy_date.formatSimpleTime(date)
        
        for (var j = 0; j < users.length; j++) {
          var user = users[j];
          if (item._openid == user.openId){
            item.avatar = user.userInfo.avatarUrl
            item.username = user.username
            break;
          }
        }

        ds.push(item)
      }

      this.setData({
        dataSource: ds
      })

       wx.hideLoading()
       wx.stopPullDownRefresh()
    }).catch(res => {
      console.log('weekDetail fail:' + res)
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },


  weekCellClick: function (e) {
    const item = e.currentTarget.dataset.item
    var offset = 0
    const username = item.username
    wx.navigateTo({
      url: '../weekDetail/weekDetail?avatar=' + item.avatarUrl + '&username=' + username + '&offset=' + offset + '&openId=' + item._openid,
    })
  },

  iconViewClick: function () {
    var offset = 0

    wx.navigateTo({
      url: '../weekDetail/weekDetail?isMe=true&offset=' + offset,
    })
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
    this.feedList(0)
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