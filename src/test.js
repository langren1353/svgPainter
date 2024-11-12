import svgFunc from './main.js'
const svgPainter1 = svgFunc()
import { createApp, ref } from 'vue/dist/vue.esm-bundler.js'
import { ElMessage } from 'element-plus'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { onMounted, reactive, watch } from "vue";

const app = createApp({
  setup() {
    const areaList = reactive([])
    const drawEnable = ref(true)
    
    async function drawOne() {
      // if(!drawEnable.value) {
      //   ElMessage.error('请先开启编辑模式')
      //   return
      // }
      const name = '区域-身体-' + Math.random()
      const area = await svgPainter1.EXP_startDraw(name)
      areaList.push({
        name,
        area
      })
      return area
    }
    
    function toggleDraw() {
      svgPainter1.svgConfig.drawEnable = drawEnable.value
      if (!drawEnable.value) {
        svgPainter1.EXP_deselectAll()
      }
    }
    
    function activateArea(name) {
      const area = svgPainter1.EXP_findAreaByName(name)
      if (area) {
        svgPainter1.EXP_deselectAll()
        area.selected = true
      }
    }
    function initDraw() {
      svgPainter1.EXP_init({
        canvasSelector: '#myCanvas1',
        drawEnable: false, // 是否允许修改
      })
      svgPainter1.EXP_loadBackground('https://pic.nfapp.southcn.com/nfplus/ossfs/pic/xy/202106/26/d4cd072c-4966-4371-8f8a-76730efd94d8.jpg', async function(image, raster) {
        // 添加图片绘制区域
        svgPainter1.EXP_drawImage('./Camera.png', 0, 100, '图标1')
        svgPainter1.EXP_drawImage('./Camera.png', 100, 100, '图标2')
        svgPainter1.EXP_drawImage('./Camera.png', 200, 100, '图标3', (image, raster) => {
          raster.source = './cat.jpg'
        })
      })
    }

    onMounted(() => {
      initDraw()
    })
    
    return {
      areaList,
      drawOne,
      toggleDraw,
      drawEnable,
      activateArea
    }
  }
})

// app.use(ElementPlus)
// app.mount('#app')

import App from './test.vue'
createApp(App).mount('#app')
