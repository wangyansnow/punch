// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mojing-123'
})
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  // 时间
  var now = new Date()
  now = new Date(now.getTime() - event.timeOffset * 60000)
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
  if (event.offset > 0) { // 上周
    fromTime = new Date(timestamp * 1000)
    fromTime.setDate(now.getDate() - week - 7)

    toTime = new Date(timestamp * 1000)
    toTime.setDate(now.getDate() - week)

  } else { // 本周
    fromTime = new Date(timestamp * 1000)
    fromTime.setDate(now.getDate() - week)
    toTime = now
  }

  var openId = event.openId
  if (openId.length == 0) {
    openId = event.userInfo.openId
  }

  const fits = await db.collection('fits').where({
    _openid: openId,
    createTime: _.gt(fromTime).and(_.lt(toTime))
  }).orderBy('createTime', 'desc').get(res=> {
    return res.data
  })

  console.log('fits:'+JSON.stringify(fits))
  var isMe = openId == event.userInfo.openId
  if (event.userInfo.openId == 'oK9PH5VjTwoiUQjbjLFOaUTITZnM') {
    isMe = true
    console.log('这是管理员')
  }

  return {
    fits: fits,
    isMe: isMe
  }

  // return fits;

}