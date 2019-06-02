// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mojing-123'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const fits = await db.collection('fits').orderBy('createTime', 'desc').limit(100).get(res => {
    return res.data
  })

  const users = await db.collection('users').where({
    _openid: event.ids
  }).get(res => {
    return res.data
  })

  return {
    fits: fits,
    users: users
  }

}