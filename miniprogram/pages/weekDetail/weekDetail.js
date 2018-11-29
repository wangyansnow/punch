const db = wx.cloud.database()
const _ = db.command
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('op:'+JSON.stringify(options))
    const username = options.username
    const avatar = options.avatar
    const offset = options.offset
    const openId = options.openId
    
    wx.setNavigationBarTitle({
      title: username,
    })

    this.weekDetail(offset, openId)
  },

  weekDetail: function(offset, openId) {
    const now = new Date()
    const timeOffset = now.getTimezoneOffset() 
    wx.cloud.callFunction({
      name: 'weekDetail',
      data: {
        timeOffset: timeOffset,
        offset: offset,
        openId: openId
      }
    }).then(res=> {
      console.log('weekDetail succ:'+JSON.stringify(res))
      
      var ds = []
      const count = res.result.data.length
      console.log('count:'+res.result.data.length)
      for (var i = 0; i < count; i++) {
          var item = res.result.data[i]
        console.log('item:' + JSON.stringify(item))
          const date = new Date(item.createTime)
          item.time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':'+ date.getSeconds()

          ds.push(item)
      }
      console.log('结束')
      this.setData({
        dataSource: ds
      })

    }).catch(res=> {
      console.log('weekDetail fail:' + JSON.stringify(res))
    })
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

  imageClick: function(e) {
    const file_id = e.currentTarget.dataset.file_id
    console.log('fileId:' + file_id)

    wx.navigateTo({
      url: '../imageDetail/imageDetail?file_id='+file_id,
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})