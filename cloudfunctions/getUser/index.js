// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mojing-123'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const users = await db.collection('users').where({
    _openid: event.ids
  }).get(res => {
    return res.data
  })

  return {
    users: users
  }

}