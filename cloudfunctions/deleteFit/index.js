// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mojing-123'
})
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  
  console.log('fitId:'+event.fitId)
  const result = db.collection('fits').doc(event.fitId).remove().then(res=>  {
    console.log('delete succ:'+JSON.stringify(res))
    return res.stats.removed == 1
  }).catch(res=> {
    console.log('delete fail:' + JSON.stringify(res))
    return false
  })
  
  return result;
}