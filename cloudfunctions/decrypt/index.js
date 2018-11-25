// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const WXBizDataCrypt = require('./WXBizDataCrypt')
const axios = require('axios');

// 云函数入口函数
exports.main = async (event, context) => {

  const code = event.code
  const appId = event.userInfo.appId
  const secret = 'b1fbb197723bbcfc29f17ed3c820fb95'
  const url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code'

  console.log('url:'+url)

  const rs = await axios(url).then(res=> {
    console.log('then...:'+JSON.stringify(res.data))
    return res.data
  }).catch(res=> {
    console.log('catch...')
    return res
  })
  console.log('结束请求:'+ JSON.stringify(rs));

  const encryptedData = event.encryptedData
  const session_key = rs.session_key
  const iv = event.iv

  const pc = new WXBizDataCrypt(appId, session_key)
  const data = pc.decryptData(encryptedData, iv)
  console.log('data:'+JSON.stringify(data))

  return data
}