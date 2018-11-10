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
    isFat: false,
    username: null,
    filePath: null,
    cloudPath: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.judgeFit()
  },

  judgeFit: function() {
    wx.cloud.callFunction({
      name: 'getFat',
      data: {}
    }).then(res => {
      if (res.result.isFit) {
        const fileId = res.result.fit.fileId
        this.setData({
          isFit: res.result.isFit,
          fileId: fileId,
          username: res.result.fit.username
        })
        console.log('已打卡')
      } else {
        this.setData({
          isFit: res.result.isFit,
          username: res.result.fit.username
        })
      }
      console.log('judgeFit succ res:' + JSON.stringify(res))
    }).catch(res => {
      console.log('judgeFit fail res:' + JSON.stringify(res))
    })
  },

  onGetUserInfo: function(e) {
    if (app.globalData.userInfo == null) {
      console.log('没有userinfo')
    } else {
      console.log('data:' + JSON.stringify(app.globalData.userInfo))
    }

    if (this.data.username == null || this.data.username.length == 0) {
      wx.showToast({
        title: '请填写真实姓名',
      })
      return;
    }

    if (this.data.desc == null || this.data.desc.length == 0) {
      wx.showToast({
        title: '请填写锻炼内容',
      })
      return;
    }

    this.doFit(e.detail.userInfo)
  },

  usernameChanged: function(e) {
    console.log("input = " + e.detail.value);

    this.setData({
      username: e.detail.value
    })
  },

  inputChanged: function(e) {
    console.log("input = "+ e.detail.value);
    this.setData({
      desc: e.detail.value
    })
  },

  testBtnClick: function(e) {
    console.log('openid:' + app.globalData.openId);
  },

  imageClick: function(e) {
    this.uploadBtnClick()
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
        const now = new Date()
        const month = now.getMonth() + 1
        const imageName = app.globalData.openId+'/'+now.getFullYear()+'-'+month+'-'+now.getDay()
        const cloudPath = imageName + filePath.match(/\.[^.]+?$/)[0]
        console.log('cloudPath:'+cloudPath)
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            const fileID = res.fileID;
            that.setData({
              fileId: fileID,
              filePath: filePath,
              cloudPath: cloudPath
            });
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
  },

  // 打卡
  doFit: function(userInfo) {
    var that = this
    db.collection('fits').add({
      data: {
        description: this.data.desc,
        createTime: db.serverDate(),
        fileId: this.data.fileId,
        cloudPath: app.globalData.cloudPath,
        filePath: this.data.filePath,
        username: this.data.username,
        userInfo: userInfo
      }
    }).then(res => {
      console.log('save succ:' + JSON.stringify(res));
      that.setData({
        isFit: true
      });
      wx.showToast({
        title: '打卡成功',
      })
    }).catch(res => {
      console.log('save error:' + JSON.stringify(res));
      wx.showToast({
        title: '打卡异常了，请重新打卡',
      })
    })
  }
})