Page({

  /**
   * 页面的初始数据
   */
  data: {
    file_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const file_id = options.file_id
    
    this.setData({
      file_id: file_id
    })
  },
})