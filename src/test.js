import svgFunc from './main.js'
const svgPainter1 = svgFunc()

svgPainter1.EXP_init({
  canvasSelector: '#myCanvas1'
})

// 设置背景绘制
svgPainter1.EXP_loadBackground('cat.jpg', async function() {
  // 添加图片绘制区域
  svgPainter1.EXP_drawImage('./Camera.png', 0, 100, '图标1')
  svgPainter1.EXP_drawImage('./Camera.png', 100, 100, '图标2')
  svgPainter1.EXP_drawImage('./Camera.png', 200, 100, '图标3')
  
  // 手动绘制区域
  const areaOne = await svgPainter1.EXP_startDraw('区域-头部', '#ccaabb88')
  const areaTwo = await svgPainter1.EXP_startDraw('区域-身体')
  
  // 修改区域颜色
  svgPainter1.EXP_changeAreaFillColor('区域-头部', '#ff0000')
  
  // 自定义事件1
  svgPainter1.EXP_areaEvent('click', (event, path) => {
    console.log('我的自定义函数Click：'+path.area_name, event)
  })

  // 自定义事件2
  svgPainter1.EXP_areaEvent('mouseenter', (event, path) => {
    console.log('我的自定义函数Enter：'+path.area_name, event)
  })

  // 自定义事件3
  svgPainter1.EXP_areaEvent('mouseleave', (event, path) => {
    console.log('我的自定义函数Leave：'+path.area_name, event)
  })
  
  // 获取所有区域
  console.log(svgPainter1.EXP_areaGetAll())
  // 导出JSON数据
  console.log(svgPainter1.svgConfig.scope.paper.project.exportJSON())
  
  // 查找区域
  const area1 = svgPainter1.EXP_findAreaByName('图标1')
  const area2 = svgPainter1.EXP_findAreaByName('图标2')
  
  // 绘制线条 直线 or 曲线
  const path = svgPainter1.EXP_drawLine([{x: 0, y: 0}, {x: 50, y: 50}, {x: 30, y: 90}], '标记-直线1', {
    strokeColor: '#ff0000',
    strokeWidth: 8,
  })

  // 根据区域，绘制线条
  const path2 = svgPainter1.EXP_drawAreaLine(['图标1', '图标2', '图标3'], '标记-线条1', {
    strokeColor: '#00ff00',
    strokeWidth: 8,
  })
  
  // 绘制文字
  const path3 = svgPainter1.EXP_drawText('你好，我是测试文字', 50, 50, '标记-文字1', {
    strokeColor: '#0000ff',
  })
})


