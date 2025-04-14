<template>
  <button size="small" @click="startDraw" :disabled="!editAble">绘制区域</button>
  <button size="small" @click="drawCamera">绘制图标</button>
  <button size="small" @click="loadJson">加载JSON</button>
  <button size="small" @click="exportJson">导出JSON</button>
  <button size="small" @click="reinit">绘制背景图</button>
  <button size="small" @click="drawTxt">绘制文字</button>
  <!-- <button size="small" @click="getAllArea">打印区域信息</button> -->
  <div id="svg-container" style="margin-left: 100px">
    <canvas id="myCanvas" width="1255" height="783"></canvas>
  </div>
<!--  <div>{{ json }}</div>-->
</template>
<script>
import svgInit from './main.js'
const svgPainter = svgInit()

class BindPathMove {
  constructor(pathA, pathB) {
    this.pathA = pathA;
    this.pathB = pathB;

    this.initialPositionA = this.pathA.position;
    this.initialPositionB = this.pathB.position;
    this.__moveEventFunc = this._moveEventFunc.bind(this);
  }
  bind() {
    this.pathA.on('mousedrag', this.__moveEventFunc);
  }
  unBind() {
    this.pathA.off('mousedrag', this.__moveEventFunc);
  }
  _moveEventFunc(event) {
    const delta = event.target.position.subtract(this.initialPositionA);
    this.pathB.position = this.initialPositionB.add(delta);
  }
}

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
      draggable: false,
      bindRes: null,
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
      svgPainter.EXP_init({
        canvasSelector: '#myCanvas', // svg的选择器，默认为 #myCanvas
        drawEnable: true, // 启用绘制，默认为false,
        dragMoveBgEnable: true, // 是否可以拖拽背景，缩放大背景：注意：这个和拖动绘制会产生冲突，拖拽结束后记得关
        dragMoveOptions: {
          minScale: 1, // 最小缩放比例
          maxScale: 2 // 最大缩放比例
        }
      })
      let image;
      // this.loadJson()
      svgPainter.EXP_loadBackground('https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg', async function(image, raster) {
        // 添加图片绘制区域
        svgPainter.EXP_drawImage('./Camera.png', 0, 0, '图标1', (img, raster) => {
          raster.noSelect = true

          // debugger
          svgPainter.EXP_drawLineWithArrow([raster.position, raster.position.add(100, 200), raster.position.add(300, 200)], '线条-未命名', {
            strokeColor: 'red',
            strokeWidth: 2,
            arrowType: 'circle',
          })
        })
        svgPainter.EXP_drawImage('./Camera.png', 100, 100, '图标2')
        svgPainter.EXP_drawImage2('./Camera.png', 200, 100, 500, 40, '图标3')
      })
      svgPainter.EXP_areaEvent('delete', (event, path) => {
        console.log('我的自定义函数=--删除', path, event)
      })
      svgPainter.EXP_areaEvent('click', (event, path) => {
        console.log('我的自定义函数Click：', path, event)
        // self.camaraPoint(event.point)
      })
      svgPainter.EXP_areaEvent('mouseenter', (event, path) => {
        console.log('我的自定义函数mouseenter：', path, event)
        // self.camaraPoint(event.point)
      })
      // const path1 = svgPainter.EXP_findAreaByName("区域-头部1731465579207")
      // const path2 = svgPainter.EXP_findAreaByName("摄像头1")
      //
      // this.bindRes = new BindPathMove(path1, path2)
      // this.bindRes.bind()
      
      // this.drawTxt()
      
      // 获取到图标层，锁定图标层（无法选中，无法触发事件）,也不会被保存JSON传递
      // const layer = svgPainter.EXP_getLayer(svgPainter.svgConfig.LAYER_TYPE.AREA_TYPE_IMG);
      // layer.locked = true
    },
    async startDraw() {
      this.bindRes.unBind()
      // let name1 = new Date().getTime()
      // const area2 = svgPainter.EXP_startDraw(`区域-头部${name1}`, '#ccaabb88')
      const newPath = await svgPainter.EXP_startDrawArea(`区域-头部2`)
      newPath.data.area_editorLocked = true
      newPath.data.area_positionLocked = true
    },
    getAllArea() {
      let allArea = svgPainter.EXP_areaGetAll()
      console.log(allArea)
    },
    drawTxt() {
      const path3 = svgPainter.EXP_drawTextWithBG('你好，我是测试文字', 0, 50, '标记-文字1', {
        strokeColor: 'white',
      }, {
        fillColor: 'blue',
        strokeWidth: 0
      })
      window.xx = path3
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
      this.json = [["Layer",{"name":"背景图","applyMatrix":true,"children":[["Raster",{"applyMatrix":false,"matrix":[0.65365,0,0,0.725,627.5,391.5],"data":{"area_name":"【唯一背景图】","area_type":"背景图"},"crossOrigin":"","source":"https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg"}]]}],["Layer",{"name":"绘制区","applyMatrix":true,"children":[["Path",{"applyMatrix":true,"data":{"area_name":"区域-头部1731465579207","area_type":"绘制区","floorId":4,"partitionId":6},"segments":[[[209.2,149.2],[48.21393,-26.51128],[-48.21393,26.51128]],[[137.2,172.2],[11.39749,-1.09192],[-11.39749,1.09192]],[[107.2,186.2],[8.1961,-6.12104],[-8.1961,6.12104]],[[108.2,213.2],[-15.18189,-15.42392],[15.18189,15.42392]],[[184.2,295.2],[-24.46855,-41.18327],[24.46855,41.18327]],[[234.2,415.2],[-12.94391,-21.84298],[12.94391,21.84298]],[[273.2,416.2],[-12.7558,7.5552],[12.7558,-7.5552]],[[304.2,405.2],[-6.03287,1.6222],[6.03287,-1.6222]],[[312.2,399.2],[-2.11271,2.95601],[2.11271,-2.95601]],[[329.2,384.2],[-10.51627,7.55376],[10.51627,-7.55376]],[[373.2,358.2],[-16.8222,7.82894],[16.8222,-7.82894]],[[421.2,342.2],[-14.19492,3.13047],[14.19492,-3.13047]],[[455.2,324.2],[-8.39811,13.64917],[8.39811,-13.64917]],[[470.2,270.2],[-1.21263,14.27285],[1.21263,-14.27285]],[[466.2,238.2],[2.24865,15.25945],[-2.24865,-15.25945]],[[459.2,180.2],[3.21805,14.68937],[-3.21805,-14.68937]],[[444.2,157.2],[6.87916,6.98309],[-6.87916,-6.98309]],[[421.2,127.2],[7.26531,10.37829],[-7.26531,-10.37829]],[[406.2,103.2],[2.05961,5.50375],[-2.05961,-5.50375]],[[405.2,94.2],[0.49624,0.60669],[-0.49624,-0.60669]],[[405.2,81.2],[-3.04457,14.06948],[3.04457,-14.06948]],[[379.2,51.2],[37.68205,-13.8846],[-37.68205,13.8846]]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"data":{"area_name":"122","area_type":"绘制区","floorId":4,"partitionId":14},"segments":[[[696,217],[13.06235,-2.61847],[-13.06235,2.61847]],[[659,216],[9.3137,1.23593],[-9.3137,-1.23593]],[[637,222],[8.68287,-7.32523],[-8.68287,7.32523]],[[603,255],[11.95484,-10.93499],[-11.95484,10.93499]],[[574,289],[6.49776,-15.93482],[-6.49776,15.93482]],[[589,330],[-23.94588,-0.32574],[23.94588,0.32574]],[[703,308],[-39.71424,-1.76222],[39.71424,1.76222]],[[777,338],[-5.19716,-0.6254],[5.19716,0.6254]],[[751,294],[12.50286,18.2638],[-12.50286,-18.2638]],[[730,251],[2.1857,14.5702],[-2.1857,-14.5702]],[[725,212],[4.75435,5.45541],[-4.75435,-5.45541]]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"data":{"area_name":"66","area_type":"绘制区","floorId":4,"partitionId":17},"segments":[[[467,408],[39.50615,18.55043],[-39.50615,-18.55043]],[[444,432],[0.13168,-16.50778],[-0.13168,16.50778]],[[411,466],[15.96713,-10.51931],[-15.96713,10.51931]],[[365,504],[14.99979,-13.41499],[-14.99979,13.41499]],[[328,538],[7.03371,-7.82073],[-7.03371,7.82073]],[[317,552],[4.86537,-3.30209],[-4.86537,3.30209]],[[313,558],[-11.4952,1.02908],[11.4952,-1.02908]],[[383,547],[-24.88458,4.18575],[24.88458,-4.18575]],[[430,540],[-5.96649,0.22791],[5.96649,-0.22791]],[[446,540],[-14.24945,1.9026],[14.24945,-1.9026]],[[508,530],[-15.0357,2.16169],[15.0357,-2.16169]],[[535,528],[-14.60775,1.45064],[14.60775,-1.45064]],[[600,520],[-18.53331,2.03574],[18.53331,-2.03574]],[[624,516],[-0.25903,2.40641],[0.25903,-2.40641]],[[631,514],[-11.43059,-5.66139],[11.43059,5.66139]],[[636,513],[33.9814,23.23913],[-33.9814,-23.23913]]],"closed":true,"fillColor":[0.8,0.66667,0.73333,0.53333],"strokeColor":[0,0,0]}]]}],["Layer",{"name":"自定义","applyMatrix":true}],["Layer",{"name":"线条","applyMatrix":true,"selected":true,"children":[["Group",{"applyMatrix":true,"selected":true,"children":[["Path",{"applyMatrix":true,"selected":true,"data":{"area_name":"线条-未命名","area_type":"线条","area_editorLocked":true,"area_positionLocked":true},"segments":[[[24,24],[0,0],[0,0],7],[[284.6588,237.38512],[0,0],[0,0],7]],"strokeColor":[1,0,0],"strokeWidth":2}],["Path",{"applyMatrix":true,"data":{"area_editorLocked":true,"area_positionLocked":true},"segments":[[277.62264,238.08679],[288.52773,240.55236],[283.95713,230.34895]],"closed":true,"fillColor":[1,0,0],"strokeColor":[1,0,0]}]]}]]}],["Layer",{"name":"图像","applyMatrix":true,"children":[["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,292.2,202.7],"data":{"area_name":"摄像头1","area_type":"图像","cameraId":1,"partitionId":6},"crossOrigin":"","source":"data:image/png;base64,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"}],["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,124,124],"data":{"area_name":"图标2","area_type":"图像"},"crossOrigin":"","source":"http://localhost:3000/Camera.png"}],["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,450,120],"data":{"area_name":"图标3","area_type":"图像"},"crossOrigin":"","source":"data:image/png;base64,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"}],["Raster",{"applyMatrix":false,"matrix":[1,0,0,1,24,24],"data":{"area_name":"图标1","area_type":"图像"},"crossOrigin":"","source":"http://localhost:3000/Camera.png"}]]}],["Layer",{"name":"文字","applyMatrix":true,"children":[["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Path",{"applyMatrix":true,"strokeColor":[0,0,0]}],["Group",{"applyMatrix":true,"children":[["Path",{"applyMatrix":true,"segments":[[-2.5,58.5],[-2.5,29.5],[182.5,29.5],[182.5,58.5]],"closed":true,"fillColor":[0,0,1],"strokeColor":[0.8,0.8,0.8],"strokeWidth":0}],["PointText",{"applyMatrix":false,"matrix":[1,0,0,1,0,50],"data":{"area_name":"标记-文字1","area_type":"文字"},"content":"你好，我是测试文字","strokeColor":[1,1,1],"fontFamily":"Arial","fontSize":20,"leading":24}]]}]]}]]
      // this.json = []
      let self = this
      svgPainter.EXP_clearAll()
      // svgPainter.svgConfig.scope.activate() // 需要先激活scope，否则多个会出现冲突
      svgPainter.EXP_importJSON(JSON.stringify(this.json))
      // svgPainter.svgConfig.scope.paper.project.importJSON(JSON.stringify(this.json))

      svgPainter.EXP_areaEvent('click', (event, path) => {
        console.log('我的自定义函数Click：' + path.area_name, event)
        // self.camaraPoint(event.point)
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
      debugger
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
