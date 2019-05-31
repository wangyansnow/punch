const db = wx.cloud.database()
const _ = db.command
const app = getApp()
const wy_date = require('../../utils/wy_date.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: [],
    isMe: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('op:'+JSON.stringify(options))

    const offset = options.offset
    const isMe = options.isMe;

    if (isMe) {
      console.log('weekDetail isMe')
      this.setData({
        isMe: isMe
      })

      this.weekDetail(offset, '')
    } else {
      const username = options.username
      const avatar = options.avatar
      const openId = options.openId

      wx.setNavigationBarTitle({
        title: username,
      })

      this.weekDetail(offset, openId)
    }
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
      const count = res.result.fits.data.length
      console.log('count:' + res.result.fits.data.length)
      for (var i = 0; i < count; i++) {
          var item = res.result.fits.data[i]
        // console.log('item:' + JSON.stringify(item))
          const date = new Date(item.createTime)
          item.time = wy_date.formatTime(date)

          ds.push(item)
      }
      console.log('结束')
      this.setData({
        dataSource: ds,
        isMe: res.result.isMe
      })

    }).catch(res=> {
      console.log('weekDetail fail:' + JSON.stringify(res))
    })
  },

  imageClick: function(e) {
    const file_id = e.currentTarget.dataset.file_id
    console.log('fileId:' + file_id)

    if (app.globalData.SDKVersion > 222) {
      var urls = []
      const count = this.data.dataSource.length
      for (var i = 0; i < count; i++) {
        urls.push(this.data.dataSource[i].fileId)
      }

      wx.previewImage({
        current: file_id,
        urls: urls,
      })
    } else {
      wx.navigateTo({
        url: '../imageDetail/imageDetail?file_id=' + file_id,
      })
    }
  },

  deleteBtnClick: function(e) {
    const index = e.currentTarget.dataset.index
    const item  = this.data.dataSource[index]

    var fileId = ''
    if (item.fileId) {
      fileId = item.fileId
    }
    console.log('lg:'+fileId.length)
    console.log('delete:'+JSON.stringify(item))

    var that = this
    wx.showModal({
      title: '确定删除',
      content: '删除后不可恢复请想好',
      success: function(res) {
        console.log('model:'+JSON.stringify(res))
        if (res.confirm) {
          console.log('点击了确定')
          that.deleteFit(item._id, fileId, index)
        } else if (res.cancel) {
          console.log('点击了取消')
        }
      }
    })
  },

  deleteFit: function(fitId, fileId, index) {
    var that = this
    wx.showLoading({
      title: '玩命删除中...',
    })
    wx.cloud.callFunction({
      name: 'deleteFit',
      data: {
        fitId: fitId,
        fileId: fileId
      }
    }).then(res => {
      wx.hideLoading()
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
    }).catch(res => {
      wx.hideLoading()
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