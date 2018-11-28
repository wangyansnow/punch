// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mojing-test-60d1ed'
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

  const fits = db.collection('fits').where({
    _openid: event.userInfo.openId,
    createTime: _.gt(fromTime).and(_.lt(toTime))
  }).orderBy('createTime', 'desc').get(res=> {
    return res.data
  })

  console.log('fits:'+JSON.stringify(fits))

  return fits

}