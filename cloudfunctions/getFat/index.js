// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const fit_promise = db.collection('fits').where({
    _openid: event.userInfo.openId
  }).orderBy('createTime', 'desc').limit(1).get()

  const user_promise = db.collection('users').where({
    openId: event.userInfo.openId
  }).limit(1).get()

  const tasks = [fit_promise, user_promise]  
  const results = await Promise.all(tasks)

  console.log('results:'+JSON.stringify(results))

  if (results[0].data.length == 0) {
    return {
      isFit: false
    }
  }

  const fit = results[0].data[0]
  const user = results[1].data[0]

  const wy_now = new Date()
  var now = new Date()
  now = new Date(now.getTime() - event.offset * 60000);
  // console.log('wy_now:' + wy_now + ', now:'+now)

  const nowStr = 'date' + now.getFullYear() + now.getMonth() + now.getDate()
  const fitStr = 'date' + fit.createTime.getFullYear() + fit.createTime.getMonth() + fit.createTime.getDate()

  console.log('nowStr:' + nowStr + ', fitStr:' + fitStr)
  var isFit = (fitStr == nowStr)

  return {
    isFit: isFit,
    fit: fit,
    user: user
  }
  
}