const db = wx.cloud.database()
const _ = db.command
const app = getApp()
const wy_date = require('../../utils/wy_date.js')

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
      // console.log('weekDetail succ:'+JSON.stringify(res))
      
      var ds = []
      const count = res.result.data.length
      console.log('count:'+res.result.data.length)
      for (var i = 0; i < count; i++) {
          var item = res.result.data[i]
        // console.log('item:' + JSON.stringify(item))
          const date = new Date(item.createTime)
          item.time = wy_date.formatTime(date)

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

  imageClick: function(e) {
    const file_id = e.currentTarget.dataset.file_id
    console.log('fileId:' + file_id)

    wx.navigateTo({
      url: '../imageDetail/imageDetail?file_id='+file_id,
    })
  },

  deleteBtnClick: function(e) {
    const index = e.currentTarget.dataset.index
    const item  = this.data.dataSource[index]

    // console.log('delete:'+JSON.stringify(item))
    var that = this
    wx.cloud.callFunction({
      name: 'deleteFit',
      data: {
        fitId: item._id
      }
    }).then(res=> {
      if (res.result) {
        wx.showToast({
          title: '删除成功',
        })
        that.data.dataSource.splice(index, 1)
        that.setData({
          dataSource: that.data.dataSource
        })
      } else {
        that.deleteFail()
      }
    }).catch(res=> {
      console.log('delete fail:' + JSON.stringify(res))
      that.deleteFail()
    })
  },

  deleteFail: function() {
    wx.showToast({
        title: '删除失败',
        image: '../../images/error.png',
      })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})