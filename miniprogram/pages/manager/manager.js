const db = wx.cloud.database({
  env: "wangyan123"
})
const _ = db.command
const app = getApp()

Page({

  data: {
    myFitCount: '',
    weeks: null
  },

  onPullDownRefresh: function() {
    this.myFit();
  },

  onLoad: function (options) {
    this.myFit()

    const now = new Date()
    const yesterday = new Date('2018-11-14 10:25:35')
    // yesterday.setDate(yesterday.getDate() - 1)

    console.log('now:' + now + ", yesterday:" + yesterday)
    var minus = parseInt(now - yesterday) / 24 / 60 / 60 / 1000;
    console.log('minus:'+minus)   

    const offset = now.getTimezoneOffset()
    var wy_date = new Date(now.getTime() + offset * 60000)
    console.log('offset:'+offset+', wy_date:'+wy_date)
  },

  weekFit: function(offset) {
    wx.showLoading({
      title: '数据加载中...',
    })
    const now = new Date()
    const timeOffset = now.getTimezoneOffset()
    wx.cloud.callFunction({
      name: 'weekFit',
      data: {
        offset: offset,
        timeOffset: timeOffset
      }
    }).then(res=> {
      this.handleResult(res.result)
      wx.hideLoading()
    }).catch(res=> {
      console.log('fail res:'+JSON.stringify(res))
      wx.hideLoading()
    })

  },

  handleResult: function(result) {
    function compare(u1, u2) {
      return u1.count < u2.count
    }

    result[2].count = 3
    result[0].count = 7
    result[1].count = 13
    result.sort(compare)

    this.setData({
      weeks:result
    })
    // console.log('succ res:' + JSON.stringify(result))
  },

  test: function() {
    console.log('test')

    function compare(a, b) { // 升序
      return a > b
    } 

    this.weekFit(0)
    var arr = [10, 23, 5, 90, 41, 6, 7];
    arr.sort(compare);
    console.log(arr);
  },

  lastWeekBtnClick: function() {
    this.weekFit(1)
  },

  myFit: function() {
    var now = new Date()
    const hour = now.getHours()
    const min = now.getMinutes()
    const seconds = now.getSeconds()
    
    var timestamp = Date.parse(now) / 1000;
    timestamp = timestamp - hour * 3600 - min * 60 - seconds

    var week = now.getDay() - 1
    if (week == -1) {
      week = 6
    }
    var before = new Date(timestamp * 1000)
    before.setDate(now.getDate() - week)
    console.log('before:'+before)

    const openId = app.globalData.openId
    db.collection('fits').where({
      _openid: openId,
      createTime: _.gt(before).and(_.lt(now))
    }).count().then(res=> {
      // console.log('res:'+res.total)
      this.setData({
        myFitCount: res.total
      })
      wx.stopPullDownRefresh()
    }).catch(res=> {
      console.log('res:' + JSON.stringify(res))
      wx.stopPullDownRefresh()
    })
  },

  onShareAppMessage: function () {
    
  }
  
})