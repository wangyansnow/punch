const db = wx.cloud.database()
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
    imgsrc: '../../images/add.png',
    canUse: false,
    date: '',
    start: '',
    end: '',
    fieldValue: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.judgeFit()
    this.setWeek()
    this.getConfig()
    this.setupPicker()

    var that = this
    wx.getStorage({
      key: 'user',
      success: function(res) {
        console.log('getStorage:'+JSON.stringify(res))
        if (res.data) {
          that.setData({
            user:res.data
          })
        }
      },
    })
  },

  setupPicker: function() {
    // 昨天
    var yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    // 7天前
    var sevenDayAgo = new Date()
    sevenDayAgo.setDate(sevenDayAgo.getDate() - 7)

    const start = sevenDayAgo.getFullYear() + '-' + (sevenDayAgo.getMonth() + 1) + '-' + sevenDayAgo.getDate()
    const end = yesterday.getFullYear() + '-'+ (yesterday.getMonth() + 1) + '-' + yesterday.getDate()

    console.log('start:'+start+', end:'+end)

    this.setData({
      start: start,
      end: end,
      date: end
    })
  },

  getConfig: function() {
    const _id = 'W_pyEyfIZl09sR1x' // 线上环境
    // const _id = 'W_u2vifIZl09sR3l' // 测试环境
    db.collection('config').doc(_id).get().then(res=> {
      // console.log('config res:' + JSON.stringify(res))
      this.setData({
        canUse: res.data.canUse
      })
    })
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
    // wx.showLoading({
    //   title: '数据加载中...',
    // })
    const now = new Date()
    const offset = now.getTimezoneOffset()
    wx.cloud.callFunction({
      name: 'getFat',
      data: {
        offset: offset
      }
    }).then(res => {
      // console.log('judgeFit:'+JSON.stringify(res))
      if (res.result.isFit) {
        const fileId = res.result.fit.fileId
        this.setData({
          isFit: res.result.isFit,
          // fileId: fileId,
          user: res.result.user,
          username: res.result.fit.username,
          // imgsrc: fileId,
          // desc: res.result.fit.description
        })
        console.log('已打卡')
        const user = res.result.user
        if (user) {
          wx.setStorage({
            key: 'user',
            data: user,
          })
        }

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

  wy_getUser: function(e) {
    if (e.detail.userInfo == null) {
      wx.showToast({
        title: '请先授权',
        image: '../../images/error.png',
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
      }).then(res => {
        console.log('保存用户成功：' + JSON.stringify(res))
      }).catch(res => {
        console.log('保存用户错误：' + JSON.stringify(res))
      })
    }

    var that = this
    db.collection('fits').add({
      data: {
        createTime: db.serverDate(),
        wxname: e.detail.userInfo.nickName,
        wxavatar: e.detail.userInfo.avatarUrl
      }
    }).then(res => {
      console.log('save succ:' + JSON.stringify(res));
      that.setData({
        isFit: true
      });
      wx.showToast({
        title: '打卡成功',
        duration: 2000
      })
    }).catch(res => {
      console.log('save error:' + JSON.stringify(res));
      wx.showToast({
        title: '打卡异常了，请重新打卡',
        image: '../../images/error.png',
        duration: 2000
      })
    })

  },

  onGetUserInfo: function(e) {
    console.log('拿到用户信息')
    if (e.detail.userInfo == null) {
      wx.showToast({
        title: '请先授权',
        image: '../../images/error.png',
      })
      return;
    } 

    if (this.data.username == null && this.data.user != null) {
      this.data.username = this.data.user.username
    }

    if (this.data.username == null || this.data.username.length == 0) {
      wx.showToast({
        title: '请填写真实姓名',
        image: '../../images/error.png',
      })
      return;
    }

    if (this.data.desc == null || this.data.desc.length == 0) {
      wx.showToast({
        title: '请填写运动类型',
        image: '../../images/error.png',
      })
      return;
    }

    if (this.data.fileId == null) {
      wx.showToast({
        title: '请上传打卡图片',
        image: '../../images/error.png',
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
          console.log('username:'+username)
        } 

        const imageName = username + app.globalData.openId+'/'+now.getFullYear()+'-'+month+'-'+now.getDate()+'-'+now.getHours()+'-'+now.getMinutes()+'-'+now.getSeconds()
        var cloudPath = imageName + filePath.match(/\.[^.]+?$/)[0]
        console.log('cloudPath:'+cloudPath)

        cloudPath = cloudPath.replace(/\s+/g, '')
        console.log('去掉空格后 cloudPath:' + cloudPath)

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
        imgsrc: '../../images/add.png',
        fieldValue: '',
      });
      wx.showToast({
        title: '打卡成功',
        duration: 2000
      })
    }).catch(res => {
      console.log('save error:' + JSON.stringify(res));
      wx.showToast({
        title: '打卡异常了，请重新打卡',
        image: '../../images/error.png',
        duration: 2000
      })
    })
  },

  // 点击头像
  iconViewClick: function() {
    console.log('点击了头像')

    wx.navigateTo({
      url: '../weekDetail/weekDetail?isMe=true&offset=0',
    })
  },

  // 补打卡
  patchBtnClick: function() {
    console.log('patchBtnClick')

    var date = Date.parse(this.data.date)
    date = new Date(date)
    console.log('date:'+date)

    var that = this
    db.collection('fits').add({
      data: {
        description: "补打卡",
        createTime: date,
        username: this.data.username,
        isPatch: true
      }
    }).then(res => {
      that.setData({
        isFit: true,
      });
      wx.showToast({
        title: '补打卡成功',
        duration: 2000
      })
    }).catch(res => {
      console.log('save error:' + JSON.stringify(res));
      wx.showToast({
        title: '补打卡异常了，请重新打卡',
        image: '../../images/error.png',
        duration: 2000
      })
    })
  },

  dateChanged: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
})