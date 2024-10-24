## 功能安装
`npm install svg-painter`

基本原理依赖于：[Paper.js](http://paperjs.org/reference/global/)

## 使用方法
### 初始化
在HTML模版中添加SVG元素依赖
```html
<canvas id="myCanvas" width="800" height="600"></canvas>
```

### 配置SVG使用元素
```js
import svgInit from 'svg-painter';
const svgPainter = svgInit()

svgPainter.EXP_init({
  canvasSelector: '#myCanvas', // svg的选择器，默认为 #myCanvas
  drawEnable: false, // 启用绘制，默认为false
})
```

### 设置背景图
```js
svgPainter.EXP_loadBackground('cat.jpg', async (img) => {
  console.log('背景图加载完成')
})
```

### 添加普通图片区域
```js
  svgPainter.EXP_drawImage(imgPath, positionX, positionY, imgName)
  svgPainter.EXP_drawImage('./Camera.png', 100, 100, '图标2')
```

### 绘制线条
path属性参照：[http://paperjs.org/reference/path/#strokecolor](http://paperjs.org/reference/path/#strokecolor)
```js
const path = svgPainter1.EXP_drawLine([{x: 0, y: 0}, {x: 50, y: 50}, {x: 30, y: 90}], '标记-直线1', {
  strokeColor: '#ff0000',
  strokeWidth: 8,
})
path.smooth() // 曲线
path.closed() // 控制是否闭合
path.strokeWidth = 10 // 线宽
path.fillColor = '#ff0000' // 填充颜色
path.opacity = 0.5 // 透明度
// path.simplify(level=0) // 用于点位的自动缩减，一般用不上
```

### 添加区域线条绘制 - 贝塞尔曲线
```js
svgPainter1.EXP_drawAreaLine([areaName1, areaName2, areaName3], lineName)
const path2 = svgPainter1.EXP_drawAreaLine(['图标1', '图标2', '图标3'], '标记-线条1', {
  strokeColor: '#00ff00',
  strokeWidth: 8,
})
path2.strokeWidth = 10 // 线宽
path2.fillColor = '#ff0000' // 填充颜色
```

### 添加文字标记
```js
const path3 = svgPainter1.EXP_drawText('你好，我是测试文字', 50, 50, '标记-文字1', {
  strokeColor: '#0000ff',
})
```

### 添加绘制区域 - 用户一次性绘制，绘制完成之后用户可以自己调整边界；
> 单击边缘会添加一个节点
> shift + 单击，会删除一个节点
```js
const area1 = svgPainter.EXP_startDraw(areaName, fillColor = randomColor)
const area2 = svgPainter.EXP_startDraw('区域-头部', '#ccaabb88')
```

### 修改区域填充颜色
```js
const area = svgPainter.EXP_changeAreaFillColor(areaName, fillColor = randomColor)
const area = svgPainter.EXP_changeAreaFillColor('区域-头部', '#ff0000')
```

### 获取所有区域 - 一般用于调试用
```js
svgPainter.EXP_areaGetAll()
```

### 获取单个区域（包括图片区域） - 一般用于调试用
```js
const area = svgPainter.EXP_findAreaByName('区域-头部')
```

### 导出JSON结果 - 推荐
```js
svgPainter.exportJSON(exported_json)
或者
svgPainter.svgConfig.scope.paper.project.exportJSON()
```

### 导入JSON结果 - 推荐
```js
svgPainter.importJSON(exported_json)
或者
svgPainter.svgConfig.scope.paper.project.importJSON(exported_json)
```

### 导出完整SVG
```js
svgPainter.EXP_exportAllSVG()
```

### 导出部分SVG
```js
svgPainter.EXP_exportAreaSVG(area_names = ['区域-头部', '区域-身体'])
```

## 事件触发
### 取消所有元素的选中
```js
svgPainter.EXP_deselectAll()
```

### 区域点击
```js
svgPainter.EXP_areaEvent('click', (event, path) => {
  console.log('我的自定义函数Click：' + path.area_name, event)
})
```

### 鼠标进入区域
```js
svgPainter.EXP_areaEvent('mouseenter', (event, path) => {
  console.log('我的自定义函数Enter：' + path.area_name, event)
})
```

### 鼠标移出区域
```js
svgPainter.EXP_areaEvent('mouseleave', (event, path) => {
  console.log('我的自定义函数Leave：' + path.area_name, event)
})
```

### 区域内鼠标移动
```js
svgPainter.EXP_areaEvent('mousemove', (event, path) => {
  console.log('我的自定义函数Leave：' + path.area_name, event)
})
```
