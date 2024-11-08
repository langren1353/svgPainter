<template>
  <button size="small" @click="startDraw" :disabled="!editAble">绘制区域</button>
  <button size="small" @click="drawCamera">绘制图标</button>
  <button size="small" @click="loadJson">加载JSON</button>
  <button size="small" @click="exportJson">导出JSON</button>
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
    }, 2000)
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
    async init(p) {
      console.log(svgPainter)
      // let {src, width, height} = p
      svgPainter.EXP_init({
        canvasSelector: '#myCanvas', // svg的选择器，默认为 #myCanvas
        drawEnable: true, // 启用绘制，默认为false,
        dragMoveBgEnable: this.draggable, // 是否可以拖拽背景，缩放大背景：注意：这个和拖动绘制会产生冲突，拖拽结束后记得关
        dragMoveOptions: {
          minScale: 1, // 最小缩放比例
          maxScale: 1.5 // 最大缩放比例
        }
      })
      let self = this
      // const canvas = document.getElementById('myCanvas')
      // canvas.addEventListener('click', function (event) {
      //   // 处理点击事件
      //   // console.log('Canvas被点击了！', event)
      //   self.cvsClick(event)
      // })
      // svgPainter.EXP_loadBackground('https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg', async (img) => {
      //   console.log('背景图加载完成')
      //   console.log(img)
      //
      //   // this.loadJson()
      //
      //  console.log( svgPainter.svgConfig.scope.projects)
      //   // const area2 = svgPainter.EXP_startDraw('区域-头部', '#ccaabb88')
      //   // let allArea = svgPainter.EXP_areaGetAll()
      //   // console.log(allArea)
      //   // let json = svgPainter.svgConfig.scope.paper.project.exportJSON()
      //   // console.log(json)
      // })
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
      this.json = [["Layer",{"name":"背景图","applyMatrix":true,"children":[["Raster",{"applyMatrix":false,"matrix":[0.41667,0,0,0.55556,400,300],"crossOrigin":"","source":"https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg"}]]}],["Layer",{"name":"自定义","applyMatrix":true,"selected":true,"children":[["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"区域-头部1731045737084","area_type":"自定义"},"segments":[[[32,55.4],[1.14872,1.69335],[-1.14872,-1.69335],7],[[25,61.4],[5.20785,-2.9587],[-5.20785,2.9587],7],[[13,80.4],[-2.98013,-14.85854],[2.98013,14.85854],7],[[40,134.4],[-8.28733,-10.60715],[8.28733,10.60715],7],[[55,134.4],[-5.87057,3.28714],[5.87057,-3.28714],7],[[78,122.4],[-6.23041,9.45859],[6.23041,-9.45859],7],[[84,83.4],[1.7922,9.87851],[-1.7922,-9.87851],7],[[72,71.4],[5.0616,2.02737],[-5.0616,-2.02737],7],[[56,65.4],[5.96139,0.012],[-5.96139,-0.012],7],[[39,67.4],[4.09282,1.92462],[-4.09282,-1.92462],7]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"区域-头部1731045739091","area_type":"自定义"},"segments":[[[141,69.4],[0.54636,-7.87239],[-0.54636,7.87239],7],[[129,120.4],[-0.06992,-14.3319],[0.06992,14.3319],7],[[148,136.4],[-7.26667,-1.8],[7.26667,1.8],7],[[160,127.4],[-1.86341,14.5319],[1.86341,-14.5319],7],[[156,70.4],[6.72031,9.67239],[-6.72031,-9.67239],7],[[133,74.4],[1.98219,-0.22147],[-1.98219,0.22147],7]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"区域-头部1731045740667","area_type":"自定义"},"segments":[[[205,66.4],[4.03711,-10.26509],[-4.03711,10.26509],7],[[186,115.4],[8.03677,-13.7014],[-8.03677,13.7014],7],[[181,134.4],[-12.18418,-2.92931],[12.18418,2.92931],7],[[246,143.4],[-19.30003,-2.58137],[19.30003,2.58137],7],[[269,143.4],[1.38432,4.25478],[-1.38432,-4.25478],7],[[257,124.4],[2.76275,4.56223],[-2.76275,-4.56223],7],[[250,111.4],[6.56468,9.49628],[-6.56468,-9.49628],7],[[220,72.4],[7.97852,9.45265],[-7.97852,-9.45265],7],[[211,62.4],[0.52122,1.6931],[-0.52122,-1.6931],7]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"区域-头部1731045743305","area_type":"自定义"},"segments":[[[312,76.4],[3.47097,-10.52024],[-3.47097,10.52024],7],[[289,126.4],[1.77842,-14.65642],[-1.77842,14.65642],7],[[313,147.4],[-11.58467,-1.85409],[11.58467,1.85409],7],[[340,150.4],[-6.43973,-1.92724],[6.43973,1.92724],7],[[355,140.4],[-4.65642,16.56303],[4.65642,-16.56303],7],[[355,71.4],[10.06539,14.6751],[-10.06539,-14.6751],7],[[312,67.4],[7.39484,-2.26343],[-7.39484,2.26343],7]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}]]}],["Layer",{"name":"线条","applyMatrix":true}],["Layer",{"name":"图像","applyMatrix":true,"selected":true,"children":[["Path",{"applyMatrix":true,"selected":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"selected":true,"strokeColor":[0,0,0]}]]}],["Layer",{"name":"文字","applyMatrix":true}],["Layer",{"name":"背景图","applyMatrix":true}],["Layer",{"name":"自定义","applyMatrix":true,"selected":true}],["Layer",{"name":"线条","applyMatrix":true}],["Layer",{"name":"图像","applyMatrix":true,"selected":true}],["Layer",{"name":"文字","applyMatrix":true}]]
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
