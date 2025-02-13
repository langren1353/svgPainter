## 功能安装
`npm install svg-painter`

基本原理依赖于：[Paper.js](http://paperjs.org/reference/global/)

## 使用方法
### 初始化
在HTML模版中添加SVG元素依赖
> 说明：需要有一个区域用于canvas的绘制
> 
> 如果需要绘制多个区域，可以添加多个canvas

```html
<canvas id="myCanvas" width="800" height="600"></canvas>
```

### 配置SVG使用元素

```js
import svgInit from 'svg-painter';
const svgPainter = svgInit()

// 该方法只能初始化一次，禁止初始化第二遍
svgPainter.EXP_init({
  canvasSelector: '#myCanvas', // svg的选择器，默认为 #myCanvas
  drawEnable: false, // 启用绘制，默认为false
  dragMoveBgEnable: false, // 是否可以拖拽背景，缩放大背景：注意：这个和拖动绘制会产生冲突，拖拽结束后记得关
  dragMoveOptions: {
    minScale: 1, // 最小缩放比例
    maxScale: 3, // 最大缩放比例
  }
})

// 需要恢复默认可以：清空、重置状态
EXP_clearAll = 清空 + 重置缩放
```

### 设置背景图
> 说明：背景图加载的尺寸会是直接铺面目标canvas，自动大小缩放，所以尽量贴合比例
```js
svgPainter.EXP_loadBackground('cat.jpg', async (img) => {
  console.log('背景图加载完成')
})
```

### 添加普通图片区域
> 说明：绘制普通图片区域，绘制之后的图片可以拖拽更换位置；支持事件
```js
  svgPainter.EXP_drawImage(imgPath, positionX, positionY, imgName)
  svgPainter.EXP_drawImage('./Camera.png', 100, 100, '图标2')

  svgPainter.EXP_drawImage2(imgPath, positionX, positionY, width, height, imgName)
  svgPainter.EXP_drawImage2('./Camera.png', 100, 100, 30, 30, '图标3')
```

### 绘制线条
> 说明：绘制普通线条；支持事件。线条有一些基本属性，具体参考官网地址
> 
> path属性参照：[http://paperjs.org/reference/path/#strokecolor](http://paperjs.org/reference/path/#strokecolor)
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
> 说明：尝试用线条去拟合已有的区域，形成画线效果；支持事件
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
> 说明：添加普通文字绘制；支持事件
```js
const path3 = svgPainter1.EXP_drawText('你好，我是测试文字', 50, 50, '标记-文字1', {
  strokeColor: '#0000ff',
})
```

### 添加绘制区域 - 用户一次性按住拖动，进行绘制，绘制完成之后用户可以自己调整边界；
> 单击边缘会添加一个节点
> shift + 单击，会删除一个节点
> other_options，参数不用都填写，只对需要修改的进行覆盖即可；如果是希望调用函数，那么需要改写成函数方式返回，返回值必须是数组
```js
const area1 = svgPainter.EXP_startDraw(areaName, fillColor = randomColor, other_options)
const area2 = svgPainter.EXP_startDraw('区域-头部', '#ccaabb88', {
  simplify: () => [2.5], // 点位自动缩减，level：0-9（default：6，官方推荐2.5），参考文档：http://paperjs.org/reference/path/#simplify
  strokeColor: 'black', // 线条颜色
  fullySelected: true, // 是否全选
  closed: true, // 是否闭合
})
```

### 添加绘制区域 - 用户多次单击页面进行绘制，类似ps，但是不具备撤销功能
> 单击边缘会添加一个节点
> shift + 单击，会删除一个节点
> other_options，参数不用都填写，只对需要修改的进行覆盖即可；如果是希望调用函数，那么需要改写成函数方式返回，返回值必须是数组
```js
const area1 = svgPainter.EXP_startDrawArea(areaName, fillColor = randomColor, other_options)
const area2 = svgPainter.EXP_startDrawArea('区域-头部', '#ccaabb88', {
  strokeColor: 'black', // 线条颜色
  fullySelected: true, // 是否全选
  closed: true, // 是否闭合
})
```

### 特殊绘制功能
> 说明：绘制区域，绘制完成之后用户可以自己调整边界；支持事件
> 用于绘制一些目前不支持的元素，例如Rectangle、Path.Circle等

```js
// 主体对象在：svgPainter.svgConfig.scope上
svgPainter.svgConfig.scope.activate()
const rect = svgPainter.svgConfig.scope.Rectangle([0, 0], [25, 25])
rect.center = view.center // 绘制在正中间

// 自定义数据的绑定
rect.data = {
  area_name: '区域的名字', // 区域名会用于查询
  area_type: '自己取一个类名-用来给自己看的',
}
// 事件绑定，否则无法触发事件
svgPainter.EXP_addCustomShape(rect, svgPainter.svgConfig.LAYER_TYPE.AREA_TYPE_CUSTOM)
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

### 删除单个区域（包括图片区域） - 一般用于调试用
```js
const area = svgPainter.EXP_deleteAreaByName('区域-头部')
```

### 调整绘制区域为可缩放、可拖拽 - 使用鼠标滚轮缩放(1-3倍)，之后就可以随意拖拽
> 注意：启用可以拖拽之后会和绘制功能有冲突，因为肯定会争抢鼠标，所以拖拽结束后，需要禁用拖拽功能
```js
// 启用缩放、拖拽
svgPainter.EXP_enableDragMoveBg()
// 禁用缩放、拖拽
svgPainter.EXP_disableDragMoveBg()
```

### 获取区域中心点
```js
// 根据area.bounds获取中心点，如果不存在，那么-1,-1
const [pointX, pointY] = svgPainter.EXP_getAreaRectCenterPointByName('区域-头部')
console.log(pointX, pointY)
```

### 重置缩放
```js
// 重置为默认1倍缩放
svgPainter.EXP_resetDefaultScale() 
```

### 导出JSON结果
```js
svgPainter.EXP_exportJSON()
```

### 导入JSON结果
```js
svgPainter.EXP_importJSON(exported_json)

// 如果需要绘制的时候进行完整的覆盖导入，那么清空即可
svgPainter.svgConfig.scope.project.clear()
```

### 导出完整SVG
> 建议使用JSON方案，SVG方案需要图片支持跨域

```js
svgPainter.EXP_exportAllSVG()
```

### 导出部分SVG
```js
svgPainter.EXP_exportAreaSVG(area_names = ['区域-头部', '区域-身体'])
```

### 清空画板
```js
svgPainter.EXP_clearAll() // 清空并重置缩放
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

### 区域删除
```js
svgPainter.EXP_areaEvent('delete', (event, path) => {
  console.log('我的自定义函数delete：', event, path)
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

### 区域拖拽事件
> 注意：缩放比例为1的时候，不会有拖拽事件触发（因为肯定拖不动）
```js
// 这个函数可以用于html元素不跟随，此时，可以用回调来销毁html元素
svgPainter.EXP_areaEvent('dragmove', (event) => {
  console.log('我的自定义函数dragmove：', event)
})
```
### 区域缩放事件
```js
// 这个函数可以用于html元素不跟随，此时，可以用回调来销毁html元素
svgPainter.EXP_areaEvent('wheel', (event) => {
  console.log('我的自定义函数wheel：', event)
})
```

## 其他说明
### 图层优先级
【文字】> 【图片】 =  > 【画线|直线|曲线】 > 【手绘区域】 > 【背景图】

```js
// 可以强制获取到目标图层
svgPainter.EXP_getLayer(svgPainter.svgConfig.LAYER_TYPE.AREA_TYPE_CUSTOM)
```

### 事件触发
点击顶层元素，不会穿透到下一层
其次不存在事件层级关系，只有绘制元素的层级关系，所以也不存在时间冒泡等

### 缩放说明
缩放参数：svgPainter.svgConfig.curDrawScale = 当前缩放比例 get|set
缩放中心：svgPainter.svgConfig.curDrawScaleCenter = 当前缩放中心点 get|set
