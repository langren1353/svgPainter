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


// const json = [
//   [
//     "Layer",
//     {
//       "applyMatrix": true,
//       "children": [
//         [
//           "Raster",
//           {
//             "applyMatrix": false,
//             "matrix": [1, 0, 0, 1, 400, 300],
//             "crossOrigin": "",
//             "source": "https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg"
//           }
//         ]
//       ]
//     }
//   ],
//   [
//     "Layer",
//     {
//       "applyMatrix": true,
//       "children": [
//         [
//           "Raster",
//           {
//             "applyMatrix": false,
//             "matrix": [1, 0, 0, 1, 400, 300],
//             "crossOrigin": "",
//             "source": "https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg"
//           }
//         ],
//         [
//           "Path",
//           {
//             "applyMatrix": true,
//             "data": {
//               "area_name": "区域-头部1730108849400",
//               "area_type": "自定义"
//             },
//             "segments": [
//               [
//                 [223, 144],
//                 [15.68028, -26.65742],
//                 [-15.68028, 26.65742]
//               ],
//               [
//                 [244, 168],
//                 [-32.19856, -4.74242],
//                 [32.19856, 4.74242]
//               ],
//               [
//                 [352, 163],
//                 [-15.88602, 26.62711],
//                 [15.88602, -26.62711]
//               ],
//               [
//                 [307, 61],
//                 [32.74264, 5.23397],
//                 [-32.74264, -5.23397]
//               ]
//             ],
//             "closed": true,
//             "fillColor": [0.8, 0.66667, 0.73333, 0.53333],
//             "strokeColor": [0, 0, 0]
//           }
//         ],
//         ["Path", { "applyMatrix": true, "strokeColor": [0, 0, 0] }],
//         [
//           "Raster",
//           {
//             "applyMatrix": false,
//             "matrix": [1, 0, 0, 1, 479, 120],
//             "data": { "area_name": "图标1730108980451", "area_type": "图像" },
//             "crossOrigin": "",
//             "source": "http://localhost:2900/img/camara.svg"
//           }
//         ]
//       ]
//     }
//   ]
// ]
//
// svgPainter2.EXP_importJSON(JSON.stringify(json))
// svgPainter2.EXP_areaEvent('click', (event, path) => {
//   console.log('我的自定义函数Click：' + path.area_name, event)
// })
