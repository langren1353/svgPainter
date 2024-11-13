<template>
  <button size="small" @click="startDraw" :disabled="!editAble">绘制区域</button>
  <button size="small" @click="drawCamera">绘制图标</button>
  <button size="small" @click="loadJson">加载JSON</button>
  <button size="small" @click="exportJson">导出JSON</button>
  <button size="small" @click="reinit">绘制背景图</button>
  <!-- <button size="small" @click="getAllArea">打印区域信息</button> -->
  <div id="svg-container" style="margin-left: 100px">
    <canvas id="myCanvas" width="800" height="600"></canvas>
  </div>
  <div>{{ json }}</div>
</template>
<script>
import svgInit from './main.js'
const svgPainter = svgInit()
export default {
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  name: 'home',
  data() {
    return {
      json: '',
      cameraMode: false,
      editAble: true,
      draggable: false
    }
  },
  mounted() {
    setTimeout(() => {
      this.init()
    }, 200)
  },
  methods: {
    switchCanDrag(v) {
      if (v) {
        svgPainter.EXP_enableDragMoveBg()
      } else {
        svgPainter.EXP_disableDragMoveBg()
      }
    },
    switchCanEdit(v) {
      svgPainter.svgConfig.drawEnable = v
    },
    reinit() {
      svgPainter.EXP_clearAll()
      svgPainter.EXP_loadBackground('https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg', async function(image, raster) {
        // 添加图片绘制区域
        svgPainter.EXP_drawImage('./Camera.png', 0, 100, '图标1')
        svgPainter.EXP_drawImage('./Camera.png', 100, 100, '图标2')
        svgPainter.EXP_drawImage('./Camera.png', 200, 100, '图标3')
      })
    },
    async init(p) {
      console.log(svgPainter)
      // let {src, width, height} = p
      svgPainter.EXP_init({
        canvasSelector: '#myCanvas', // svg的选择器，默认为 #myCanvas
        // drawEnable: false, // 启用绘制，默认为false,
        // dragMoveBgEnable: this.draggable, // 是否可以拖拽背景，缩放大背景：注意：这个和拖动绘制会产生冲突，拖拽结束后记得关
        // dragMoveOptions: {
        //   minScale: 1, // 最小缩放比例
        //   maxScale: 1.5 // 最大缩放比例
        // }
      })
      svgPainter.EXP_enableDragMoveBg()
      let self = this
      // const canvas = document.getElementById('myCanvas')
      // canvas.addEventListener('click', function (event) {
      //   // 处理点击事件
      //   // console.log('Canvas被点击了！', event)
      //   self.cvsClick(event)
      // })
      // svgPainter.EXP_loadBackground('https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg', async (img, raster) => {
      //   raster.source = './cat.jpg'
      //  
      //   // this.loadJson()
      //
      //   // const area2 = svgPainter.EXP_startDraw('区域-头部', '#ccaabb88')
      //   // let allArea = svgPainter.EXP_areaGetAll()
      //   // console.log(allArea)
      //   // let json = svgPainter.svgConfig.scope.paper.project.exportJSON()
      //   // console.log(json)
      // })
      svgPainter.EXP_loadBackground('https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg', async function(image, raster) {
        // 添加图片绘制区域
        svgPainter.EXP_drawImage('./Camera.png', 0, 100, '图标1')
        svgPainter.EXP_drawImage('./Camera.png', 100, 100, '图标2')
        svgPainter.EXP_drawImage2('./Camera.png', 200, 100, 500, 40, '图标3')
      })
      svgPainter.EXP_areaEvent('delete', (event, path) => {
        console.log('我的自定义函数=--删除', path, event)
      })
    },
    startDraw() {
      let name1 = new Date().getTime()
      const area2 = svgPainter.EXP_startDraw(`区域-头部${name1}`, '#ccaabb88')
    },
    getAllArea() {
      let allArea = svgPainter.EXP_areaGetAll()
      console.log(allArea)
    },
    drawTxt() {
      const path3 = svgPainter.EXP_drawText('你好，我是测试文字', 0, 50, '标记-文字1', {
        strokeColor: '#0000ff'
      })
    },
    camaraPoint({ x, y }) {
      let name1 = new Date().getTime()
      if (!this.cameraMode) {
        return
      }
      console.log('绘制点位')
      svgPainter.EXP_drawImage('./Camera.png', x, y, `图标${name1}`, () => {
        this.cameraMode = false
      })
    },
    drawCamera() {
      this.cameraMode = true
    },
    // cvsClick(e) {
    //   let { offsetX, offsetY } = e
    //   console.log(offsetX, offsetY)
    //   let name1 = new Date().getTime()
    //   if (!this.cameraMode) {
    //     return
    //   }
    //   svgPainter.EXP_drawImage('./img/camara.svg', offsetX, offsetY, `图标${name1}`)
    // },
    loadJson() {
      this.json = [["Layer",{"name":"背景图","applyMatrix":true,"selected":true,"children":[["Raster",{"applyMatrix":false,"matrix":[0.41667,0,0,0.55556,400,300],"selected":true,"data":{"area_name":"x背景图-唯一值","area_type":"图像"},"crossOrigin":"","source":"https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg"}]]}],["Layer",{"name":"绘制区","applyMatrix":true,"selected":true,"children":[["Path",{"applyMatrix":true,"data":{"area_name":"区域-头部1731074111385","area_type":"绘制区"},"segments":[[[89,65.66667],[12.30461,-12.02911],[-12.30461,12.02911]],[[52,133.66667],[-12.55949,-26.15939],[12.55949,26.15939]],[[154,169.66667],[-27.06667,12.66667],[27.06667,-12.66667]],[[158,85.66667],[14.82615,23.49272],[-14.82615,-23.49272]],[[107,63.66667],[14.76205,-0.63755],[-14.76205,0.63755]],[[86,61.66667],[-1.87436,3.05749],[1.87436,-3.05749]]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"data":{"area_name":"区域-头部1731074114215","area_type":"绘制区"},"segments":[[[339,67.66667],[14.07831,-14.95579],[-14.07831,14.95579]],[[277,151.66667],[5.13042,-26.14439],[-5.13042,26.14439]],[[333,181.66667],[-28.6,5.53333],[28.6,-5.53333]],[[396,133.66667],[-9.73042,22.01105],[9.73042,-22.01105]],[[386,78.66667],[14.52169,9.42245],[-14.52169,-9.42245]],[[343,69.66667],[4.64367,4.29914],[-4.64367,-4.29914]]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"data":{"area_name":"区域-头部1731074116393","area_type":"绘制区"},"segments":[[[589,92.66667],[-6.92865,-2.97182],[6.92865,2.97182]],[[564,104.66667],[16.68216,-7.72371],[-16.68216,7.72371]],[[532,153.66667],[-2.8,-27.13333],[2.8,27.13333]],[[588,209.66667],[-29.48216,11.25704],[29.48216,-11.25704]],[[643,105.66667],[9.72865,30.10516],[-9.72865,-30.10516]],[[566,81.66667],[12.56758,-3.67767],[-12.56758,3.67767]]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"区域-头部1731074118576","area_type":"绘制区"},"segments":[[[215,285.66667],[7.23737,-10.24128],[-7.23737,10.24128],7],[[139,343.66667],[23.80488,-17.64595],[-23.80488,17.64595],7],[[123,369.66667],[-10.45688,-3.17491],[10.45688,3.17491],7],[[230,374.66667],[-72.97737,-0.65443],[72.97737,0.65443],7],[[492,374.66667],[-66.63363,0.79261],[66.63363,-0.79261],7],[[580,372.66667],[-10.48811,-0.516],[10.48811,0.516],7],[[605,371.66667],[-4.41394,4.27139],[4.41394,-4.27139],7],[[604,348.66667],[4.14389,7.43044],[-4.14389,-7.43044],7],[[596,325.66667],[-3.1616,12.00684],[3.1616,-12.00684],7],[[587,287.66667],[25.50251,5.5422],[-25.50251,-5.5422],7],[[444,294.66667],[53.15155,-3.17563],[-53.15155,3.17563],7],[[317,293.66667],[31.8913,1.16031],[-31.8913,-1.16031],7],[[239,293.66667],[24.28327,-0.46561],[-24.28327,0.46561],7],[[190,289.66667],[-2.02438,4.70212],[2.02438,-4.70212],7]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}]]}],["Layer",{"name":"自定义","applyMatrix":true}],["Layer",{"name":"线条","applyMatrix":true}],["Layer",{"name":"图像","applyMatrix":true,"selected":true,"children":[["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"strokeColor":[0,0,0]}]]}],["Layer",{"name":"文字","applyMatrix":true}]]
      let self = this
      // svgPainter.svgConfig.scope.activate() // 需要先激活scope，否则多个会出现冲突
      svgPainter.EXP_importJSON(JSON.stringify(this.json))
      // svgPainter.svgConfig.scope.paper.project.importJSON(JSON.stringify(this.json))
      
      svgPainter.EXP_areaEvent('click', (event, path) => {
        console.log('我的自定义函数Click：' + path.area_name, event)
        self.camaraPoint(event.point)
      })
      
      // svgPainter.EXP_areaEvent('mouseenter', (event, path) => {
      //   console.log('我的自定义函数Enter：' + path.area_name, event)
      // })

      // svgPainter.EXP_areaEvent('mouseleave', (event, path) => {
      //   console.log('我的自定义函数Leave：' + path.area_name, event)
      // })
      // svgPainter.EXP_areaEvent('mousemove', (event, path) => {
      //   console.log('我的自定义函数Leave：' + path.area_name, event)
      // })
    },

    exportJson() {
      svgPainter.svgConfig.scope.activate()
      let json = svgPainter.EXP_exportJSON()
      this.json = json
    },
    drawArea() {
      svgPainter.EXP_drawAreaLine([areaName1, areaName2, areaName3], lineName)
      const path2 = svgPainter.EXP_drawAreaLine(['图标1', '图标2', '图标3'], '标记-线条1', {
        strokeColor: '#00ff00',
        strokeWidth: 8
      })
      path2.strokeWidth = 10 // 线宽
      path2.fillColor = '#ff0000'
    },
    draw1() {
      const path = svgPainter.EXP_drawLine(
        [
          { x: 0, y: 0 },
          { x: 50, y: 50 },
          { x: 30, y: 90 }
        ],
        '标记-直线1',
        {
          strokeColor: '#ff0000',
          strokeWidth: 8
        }
      )
      path.smooth() // 曲线
      path.closed() // 控制是否闭合
      path.strokeWidth = 10 // 线宽
      path.fillColor = '#ff0000' // 填充颜色
      path.opacity = 0.5
    }
  }
}
</script>
