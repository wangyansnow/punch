const db = wx.cloud.database({
  env: "wangyan123"
})
const _ = db.command
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileId: null,
    desc: '',
    isFat: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.judgeFit()
  },

  judgeFit: function() {
    var that = this
    wx.cloud.callFunction({
      name: 'getFat',
      data: {}
    }).then(res => {
      that.setData({
        isFit: res.result.isFit,
        fileId: res.result.fit.fileId
      })
      // console.log('judgeFit succ res:' + JSON.stringify(res))
    }).catch(res => {
      console.log('judgeFit fail res:' + JSON.stringify(res))
    })
  },

  onGetUserInfo: function(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)

    // console.log('data:'+app.globalData.userInfo)
  },

  inputChanged: function(e) {
    console.log("input = "+ e.detail.value);
    this.setData({
      desc: e.detail.value
    })
  },

  testBtnClick: function(e) {
    console.log('openid:' + app.globalData.openid);
  },

  uploadBtnClick: function(e) {
    // 选择图片
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            const fileID = res.fileID

            db.collection('fits').add({
              data: {
                description: that.data.desc,
                createTime: db.serverDate(),
                fileId: fileID,
                cloudPath: app.globalData.cloudPath,
                filePath: filePath
              }
            }).then(res=> {
              console.log('save succ:' + JSON.stringify(res));
              that.setData({
                fileId: fileID,
                isFit: true
              });
              wx.showToast({
                title: '打卡成功',
              })
            }).catch(res=> {
              console.log('save error:' + JSON.stringify(res));
              wx.showToast({
                title: '打卡异常了，请重新打卡',
              })
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  }
})