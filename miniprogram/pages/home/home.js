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
    isFit: false,
    username: null,
    filePath: null,
    cloudPath: null,
    user: null,
    year: '',
    month: '',
    imgsrc: '../../images/add.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.judgeFit()
    this.setWeek()
  },

  setWeek: function() {
    const now = new Date()

    const year = now.getFullYear() + '年'
    var month = now.getMonth() + 1
    const day = now.getDate()
    const week = now.getDay()
    const weeks = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六',]

    console.log('year:' + year + ", month:" + month + ', day:' + day + ', week:' + weeks[week])

    month = month + '月' + day + '日' + ' ' + weeks[week]
    this.setData({
      year: year,
      month: month
    })
  },

  onPullDownRefresh: function() {
    this.judgeFit()
  },

  judgeFit: function() {
    wx.showLoading({
      title: '数据加载中...',
    })
    const now = new Date()
    const offset = now.getTimezoneOffset()
    wx.cloud.callFunction({
      name: 'getFat',
      data: {
        offset: offset
      }
    }).then(res => {
      if (res.result.isFit) {
        const fileId = res.result.fit.fileId
        this.setData({
          isFit: res.result.isFit,
          // fileId: fileId,
          username: res.result.fit.username,
          user: res.result.user,
          // imgsrc: fileId,
          // desc: res.result.fit.description
        })
        console.log('已打卡')
      } else {
        this.setData({
          isFit: res.result.isFit,
          username: res.result.fit.username,
          user: res.result.user,
        })
      }
      app.globalData.username = res.result.fit.username
      // console.log('judgeFit succ res:' + JSON.stringify(res))
      wx.hideLoading()

      wx.stopPullDownRefresh()
    }).catch(res => {
      console.log('judgeFit fail res:' + JSON.stringify(res))
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  onGetUserInfo: function(e) {
    console.log('拿到用户信息')
    if (e.detail.userInfo == null) {
      wx.showToast({
        title: '请先授权',
      })
      return;
    } 

    if (this.data.username == null || this.data.username.length == 0) {
      wx.showToast({
        title: '请填写真实姓名',
      })
      return;
    }

    if (this.data.desc == null || this.data.desc.length == 0) {
      wx.showToast({
        title: '请填写运动类型',
      })
      return;
    }

    if (this.data.fileId == null) {
      wx.showToast({
        title: '请上传打卡图片',
      })
      return;
    }

    if (this.data.user == null) {
      console.log('保存用户')
      wx.cloud.callFunction({
        name: 'saveUser',
        data: {
          'user': e.detail.userInfo,
          'username': this.data.username
        }
      }).then(res=> {
        console.log('保存用户成功：' + JSON.stringify(res))
      }).catch(res=> {
        console.log('保存用户错误：'+JSON.stringify(res))
      })
    }

    this.doFit(e.detail.userInfo)
  },

  usernameChanged: function(e) {
    console.log("input = " + e.detail.value);

    this.setData({
      username: e.detail.value,
    })
  },

  inputChanged: function(e) {
    console.log("input = "+ e.detail.value);
    this.setData({
      desc: e.detail.value
    })
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
        var username = that.data.username
        if (that.data.user != null) {
          username = that.data.user.username
        } 

        const imageName = username + app.globalData.openId+'/'+now.getFullYear()+'-'+month+'-'+now.getDate()+'-'+now.getHours()+'-'+now.getMinutes()+'-'+now.getSeconds()
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
              cloudPath: cloudPath,
              imgsrc: fileID,
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
        wxname: userInfo.nickName
      }
    }).then(res => {
      console.log('save succ:' + JSON.stringify(res));
      that.setData({
        isFit: true,
        desc: '',
        fileId: null,
        imgsrc: '../../images/add.png'
      });
      wx.showToast({
        title: '打卡成功',
        duration: 2000
      })
    }).catch(res => {
      console.log('save error:' + JSON.stringify(res));
      wx.showToast({
        title: '打卡异常了，请重新打卡',
        duration: 1.0
      })
    })
  },

  onShareAppMessage: function() {

  }
})