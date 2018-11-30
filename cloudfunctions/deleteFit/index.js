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
  const result = await db.collection('fits').doc(event.fitId).remove().then(res=>  {
    console.log('delete fit succ:'+JSON.stringify(res))
    return res.stats.removed == 1
  }).catch(res=> {
    console.log('delete fit fail:' + JSON.stringify(res))
    return false
  })

  if (event.fileId.length > 0) { // 删除文件
    const fileRs = await cloud.deleteFile({
      fileList: [event.fileId]
    }).then(res=> {
      console.log('delete file succ:'+JSON.stringify(res))
    }).catch(res=> {
      console.log('delete file fail:' + JSON.stringify(res))
    })

    console.log('fileRs:'+JSON.stringify(fileRs))
  }


  
  return result;
}