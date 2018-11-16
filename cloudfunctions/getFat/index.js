// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const promise = db.collection('fits').where({
    _openid: event.userInfo.openId
  }).orderBy('createTime', 'desc').limit(1).get()
  const tasks = []
  tasks.push(promise)
  const fits = (await Promise.all(tasks)).reduce((acc, cur)=> {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg
    }
  })
  const fit = fits.data[0]

  const wy_now = new Date()
  var now = new Date()
  now = new Date(now.getTime() - event.offset * 60000);
  console.log('wy_now:' + wy_now + ', now:'+now)

  const nowStr = 'date' + now.getFullYear() + now.getMonth() + now.getDate()
  const fitStr = 'date' + fit.createTime.getFullYear() + fit.createTime.getMonth() + fit.createTime.getDate()

  console.log('nowStr:' + nowStr + ', fitStr:' + fitStr)
  var isFit = (fitStr == nowStr)

  const userResult = await db.collection('users').where({
    openId: event.userInfo.openId
  }).limit(1).get().then(res=> {
    return {
      data: res.data
    }
  })

  // console.log('user:' + JSON.stringify(userResult))


  return {
    isFit: isFit,
    fit: fit,
    user: userResult.data[0]
  }
  
}