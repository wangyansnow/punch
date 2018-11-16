const db = wx.cloud.database({
  env: "wangyan123"
})
const _ = db.command
const app = getApp()

Page({

  data: {
    myFitCount: '',
    weeks: null,
    isLastWeek: false,
  },

  onPullDownRefresh: function() {
    this.requestData()
  },

  onLoad: function (options) {
    this.requestData()
  },

  requestData: function() {
    this.myFit()
    this.weekFit()
  },

  weekFit: function() {
    var offset = 0;
    if (this.data.isLastWeek) {
      offset = 1;

      console.log('加载上周数据');
    } else {
      console.log('加载本周数据');
    }

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
    result.sort(compare)

    this.setData({
      weeks:result
    })
    // console.log('succ res:' + JSON.stringify(result))
  },

  thisWeekBtnClick: function() {
    this.setData({
      isLastWeek: false
    })

    this.requestData()
  },

  lastWeekBtnClick: function() {
    this.setData({
      isLastWeek: true
    })

    this.requestData()
  },

  myFit: function() {
    var now = new Date()
    const hour = now.getHours()
    const min = now.getMinutes()
    const seconds = now.getSeconds()

    var timestamp = Date.parse(now) / 1000;
    timestamp = timestamp - hour * 3600 - min * 60 - seconds
    const todayZeroTime = new Date(timestamp * 1000) // 凌晨时间

    var week = now.getDay() - 1
    if (week == -1) {
      week = 6
    }

    var fromTime;
    var toTime;

    // 2. 确定时间段
    if (this.data.isLastWeek) { // 上周
      fromTime = new Date(timestamp * 1000)
      fromTime.setDate(now.getDate() - week - 7)

      toTime = new Date(timestamp * 1000)
      toTime.setDate(now.getDate() - week)

    } else { // 本周
      fromTime = new Date(timestamp * 1000)
      fromTime.setDate(now.getDate() - week)
      toTime = now
    }

    const openId = app.globalData.openId
    db.collection('fits').where({
      _openid: openId,
      createTime: _.gt(fromTime).and(_.lt(toTime))
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
    
  },
  
})