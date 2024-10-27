import svgFunc from './main.js'

const svgPainter1 = svgFunc()
const svgPainter2 = svgFunc()

svgPainter1.EXP_init({
  canvasSelector: '#myCanvas1',
  drawEnable: true, // 是否允许修改
})

svgPainter2.EXP_init({
  canvasSelector: '#myCanvas2',
  drawEnable: false, // 是否允许修改
})

// 设置背景绘制
svgPainter1.EXP_loadBackground('https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg', async function() {
  // 添加图片绘制区域
  svgPainter1.EXP_drawImage('./Camera.png', 0, 100, '图标1')
  svgPainter1.EXP_drawImage('./Camera.png', 100, 100, '图标2')
  svgPainter1.EXP_drawImage('./Camera.png', 200, 100, '图标3')

  console.log(svgPainter1.svgConfig.scope.project.activeLayer)
  console.log(svgPainter2.svgConfig.scope.project.activeLayer)

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

  // 导出，并绘制到另一个元素上
  // const json = svgPainter1.svgConfig.scope.project.exportJSON()
  // svgPainter2.EXP_importJSON(json)
})


const json = [["Layer",{"applyMatrix":true,"selected":true,"children":[["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,400,300],"crossOrigin":"","source":"https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg"}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"区域-身体","area_type":"自定义"},"segments":[[[588,183],[-18.46329,-10.06268],[18.46329,10.06268],7],[[624,214],[5.0692,-21.35369],[-5.0692,21.35369],7],[[555,287],[31.18649,-8.52255],[-31.18649,8.52255],7],[[492,238],[2.18484,31.44389],[-2.18484,-31.44389],7],[[535,161],[-19.92583,8.747],[19.92583,-8.747],7]],"closed":true,"fillColor":["hsl",79.46407,1,0.23588,0.3],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"区域-头部","area_type":"自定义"},"segments":[[[326,119],[-8.48517,15.24441],[8.48517,-15.24441],7],[[384,124],[-21.61204,-22.2111],[21.61204,22.2111],7],[[420,224],[0.93333,-31.4],[-0.93333,31.4],7],[[375,270],[26.87871,1.8111],[-26.87871,-1.8111],7],[[304,232],[7.55184,16.15559],[-7.55184,-16.15559],7],[[323,183],[-5.08606,20.56654],[5.08606,-20.56654],7]],"closed":true,"fillColor":[1,0,0],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"标记-直线1","area_type":"线条"},"segments":[[[0,0],[0,0],[0,0],7],[[50,50],[0,0],[0,0],7],[[30,90],[0,0],[0,0],7]],"strokeColor":[1,0,0],"strokeWidth":8}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"标记-线条1","area_type":"线条"},"segments":[[[24,124],[0,0],[0,0],7],[[124,124],[0,0],[0,0],7],[[224,124],[0,0],[0,0],7]],"strokeColor":[0,1,0],"strokeWidth":8}],["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,24,124],"data":{"area_name":"图标1","area_type":"图像"},"crossOrigin":"","source":"http://localhost:3000/Camera.png"}],["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,124,124],"data":{"area_name":"图标2","area_type":"图像"},"crossOrigin":"","source":"http://localhost:3000/Camera.png"}],["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,224,124],"data":{"area_name":"图标3","area_type":"图像"},"crossOrigin":"","source":"http://localhost:3000/Camera.png"}],["Path",{"applyMatrix":true,"selected":true,"strokeColor":[0,0,0]}],["PointText",{"applyMatrix":false,"matrix":[1,0,0,1,50,50],"data":{"area_name":"标记-文字1","area_type":"文字"},"content":"你好，我是测试文字","strokeColor":[0,0,1],"fontFamily":"Arial","fontSize":20,"leading":24}]]}]]
svgPainter2.EXP_importJSON(JSON.stringify(json))
svgPainter2.EXP_areaEvent('click', (event, path) => {
  console.log('我的自定义函数Click：' + path.area_name, event)
})
