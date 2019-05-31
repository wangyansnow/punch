// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mojing-123'
})
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  console.log("王俨 开始")
  // 1. 获取所有的用户
  var users = await db.collection('users').get().then(res=> {
    return res.data
  })
  // console.log('王俨 users:'+JSON.stringify(users))
  
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

  // 3. 遍历获取每个用户的打卡次数
  var weeks = []
  var totalCounts = []
  
  var totalLength = users.length
  var start = 0;

  // console.log("开始 while")
  while (start < totalLength) {
    var nextStart = start + 20;
    if (nextStart > totalLength) {
      nextStart = totalLength
    }

    var tasks = []
    for (var i = start; i < nextStart; ++i) {
      var user = users[i]

      const promise = db.collection('fits').where({
        _openid: user.openId,
        createTime: _.gt(fromTime).and(_.lt(toTime))
      }).count()
      tasks.push(promise)
    }
    const counts = await Promise.all(tasks)
    for (var j = 0; j < counts.length; j++) {
      var item = counts[j]
      totalCounts.push(item)
    }
    start = nextStart
  }

  // console.log("过来了:" + JSON.stringify(totalCounts))

  var wy_now = new Date()
  wy_now = new Date(wy_now.getTime() - event.timeOffset * 60000)
  var wy_week = wy_now.getDay()
  if (wy_week == 0) {
    wy_week = 7;
  } // 1~7 => 周一 ~ 周日

  for (var i = 0; i < totalLength; ++i) {
    var user = users[i]
    var count = totalCounts[i].total
    var isWarn = count < 3

    if (event.offset == 0) { // 本周
      if (wy_week < 4) {
        isWarn = false;
      }
    }

    const week = {
      user: user,
      count: count,
      isWarn: isWarn
    }

    weeks.push(week)
  }
  
  return weeks
}