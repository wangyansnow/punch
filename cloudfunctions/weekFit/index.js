// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  // 1. 获取所有的用户
  var users = await db.collection('users').get().then(res=> {
    return res.data
  })
  console.log('users:'+JSON.stringify(users))

  // 2. 遍历获取每个用户的打卡次数
  var weeks = []
  for (var i = 0; i < users.length; ++i) {
    var user = users[i]

    const count = await db.collection('fits').where({
      _openid: user.openId
    }).count().then(res=> {
      return res.total
    })

    const week = {
      user: user,
      count: count
    }
    
    weeks.push(week)
  }
  
  return weeks


}