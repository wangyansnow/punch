// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mojing-123'
})

// 云函数入口函数
exports.main = async (event, context) => {
  // console.log('event:'+JSON.stringify(event))

  const countResult = await db.collection('users').where({
    openId: event.userInfo.openId
  }).count()
  const count = countResult.total
  console.log('result:'+JSON.stringify(countResult)+', count:'+count)
  
  if (count > 0) {
    return {
      isSave: true,
      msg: '之前已经保存了的'
    }
  }

  const addResult = await db.collection('users').add({
    data: {
      username: event.username,
      userInfo: event.user,
      createTime: db.serverDate(),
      openId: event.userInfo.openId
    }
  })

  console.log('addResult:'+JSON.stringify(addResult))
  var isSucc = addResult._id.length > 0
  return {
    'isSave': isSucc,
    msg: '新增用户成功'
  }
}