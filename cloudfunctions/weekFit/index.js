// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  // 1. 获取所有的用户
  var users = await db.collection('users').get().then(res=> {
    return res.data
  })
  // console.log('users:'+JSON.stringify(users))

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
  var tasks = []
  
  for (var i = 0; i < users.length; ++i) {
    var user = users[i]

    const promise = db.collection('fits').where({
      _openid: user.openId,
      createTime: _.gt(fromTime).and(_.lt(toTime))
    }).count()
    tasks.push(promise)
  }

  const counts = await Promise.all(tasks)

  for (var i = 0; i < users.length; ++i) {
    var user = users[i];
    var count = counts[i].total;

    const week = {
      user:user,
      count: count
    }

    weeks.push(week)
  }
  
  return weeks
}