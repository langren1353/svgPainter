/***
 * 注意这种PaperScript的写法（可以用普通js替代，区别在于调用paper下的字对象是否需要加paper，以及向量的加减乘除-需要用函数调用了，不能是+-*）：
 *  不支持const、let
 *  不支持lambda表达式写法
 */
import paper from 'paper/dist/paper-core';

export default function() {
  const AREA_TYPE_BG = '背景图';
  const AREA_TYPE = '绘制区';
  const AREA_TYPE_CUSTOM = '自定义';
  const AREA_TYPE_IMG = '图像';
  const AREA_TYPE_LINE = '线条';
  const AREA_TYPE_TEXT = '文字';
  const scope = new paper.PaperScope()
  let isInitialized  = false

  let svgConfig = {
    scope,
    canvasSelector: '#myCanvas',
    tool: new scope.Tool(),
    drawEnable: false, // 是否绘制模式：用于修改已绘制的元素
    drawEnable: true, // 是否绘制模式：用于修改已绘制的元素
    dragMoveBgEnable: false, // 是否可以拖拽背景，缩放大背景
    dragMoveOptions: {
      minScale: 1, // 最小缩放比例
      maxScale: 3, // 最大缩放比例
    },
    curDrawScale: 1, // 当前缩放比例
    curDrawCenter: null,
    history: null,
    hitOptions: {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: 5
    },
    areaWatch: [],
    LAYER_TYPE: {
      AREA_TYPE_BG,
      AREA_TYPE,
      AREA_TYPE_CUSTOM,
      AREA_TYPE_IMG,
      AREA_TYPE_LINE,
      AREA_TYPE_TEXT
    }
  }

  class HistoryStack {
    constructor() {
      this.pointsStack = []
      this.index = -1
    }

    // 主要调用这个
    save() {
      if (this.index < this.pointsStack.length - 1) {
        this.pointsStack = this.pointsStack.slice(0, this.index + 1)
      }
      if (this.pointsStack.length >= 20) {
        this.pointsStack.shift()
      }
      const curJSON = EXP_exportJSON()
      const lastJSON = this.pointsStack[this.index]
      if (curJSON !== lastJSON) {
        // console.log('调用了save')
        this.push(curJSON)
      }
    }

    push(item) {
      this.pointsStack.push(item)
      this.index++
    }

    pop() {
      if (this.index > 0) {
        this.pointsStack.pop()
        this.index--
      }
    }

    undo() {
      if (this.index > 0) {
        console.log('调用了undo')
        this.index--
        scope.activate()
        scope.project.clear()
        EXP_importJSON(this.pointsStack[this.index])
        return this.pointsStack[this.index]
      }
      return null
    }

    redo() {
      if (this.index < this.pointsStack.length - 1)
        this.index++

      console.log('调用了redo')
      scope.activate()
      scope.project.clear()
      EXP_importJSON(this.pointsStack[this.index])
      return this.pointsStack[this.index]
    }
  }

  var choosePoint, activeShape;

  function onMouseDown(event) {
    choosePoint = activeShape = null;
    var hitResult = scope.project.hitTest(event.point, svgConfig.hitOptions);
    if (!hitResult)
      return;

    activeShape = hitResult.item;
    console.log('点击了：' + (activeShape.area_name || hitResult.type))

    if(activeShape) {
      EXP_deselectAll()
      activeShape.selected = true;
    }

    // 绘制的模式时，才可以修改
    if(!svgConfig.drawEnable) return;

    if (event.modifiers.shift) {
      if (hitResult.type === 'segment') {
        hitResult.segment.remove();
        svgConfig.history.save()
      }
    }

    if (hitResult.type === 'pixel') { // 跳过图片处理
      if(!activeShape.area_type || activeShape.area_type === AREA_TYPE_BG) { // 跳过没有标记特定区域的 and 跳过是背景图的
        choosePoint = null;
        activeShape = null;
      }
    } else if (hitResult.type === 'segment') { // 点位
      choosePoint = hitResult.segment;
    } else if (hitResult.type === 'stroke') { // 线条
      const location = hitResult.location;
      choosePoint = activeShape.insert(location.index + 1, event.point);
      svgConfig.history.save()
    } else if (hitResult.type === 'fill') { // 填充的图像
    }
  }

  function onMouseDrag(event) {
    // 绘制的模式时，才可以修改
    if(!svgConfig.drawEnable) return;

    if (choosePoint) { // 增加点位
      choosePoint.point = choosePoint.point.add(event.delta);
    } else if (activeShape) { // 移动路径
      activeShape.position = activeShape.position.add(event.delta);
    }
  }

  /**
   *
   * @param item 形状，例如path
   * @param type 分类，例如：svgPainter.svgConfig.TYPE.AREA_TYPE_CUSTOM
   * @returns {*}
   */
  function EXP_addCustomShape(item, type) {
    addToLayer(type, item)
    bindPathEvent(item)
    return item
  }

  function onMouseUp(event) {
    if (choosePoint || activeShape) { // 增加点位
      svgConfig.history.save()
    }
  }

  function onKeyDown({ event }) {
    if(!svgConfig.drawEnable) return;

    if (event.ctrlKey && event.key === 'z') {
      svgConfig.history.undo()
    } else if (event.ctrlKey && event.key === 'y') {
      svgConfig.history.redo()
    } else if (event.ctrlKey && event.key === 's') {
    } else if (event.key === 'Delete') {
      // 删除选中元素
      if (activeShape) {
        activeShape.remove();
        svgConfig.history.save()

        svgConfig.areaWatch.filter(one => one.watchEvent === 'delete').map(item => {
          item.callback(event, activeShape)
        })
      }
    }
  }

  function EXP_areaEvent(event, callback) {
    svgConfig.areaWatch.push({
      watchEvent: event,
      callback: callback
    })
  }

  function EXP_areaGetAll() {
    const result = [];

    svgConfig.scope.project.layers.map(layer => {
      result.push(...layer.children)
    })
    return result
  }

  function EXP_deselectAll() {
    scope.activate()
    scope.project.activeLayer.selected = false;
    scope.project.deselectAll()
  }

  /**
   *
   * @param area_names 区域名称
   * @returns {string} 指定的这些区域集合的SVG字符串
   */
  function EXP_exportAreaSVG(area_names) {
    const exportGroup = new scope.Group();
    for (var name in area_names) {
      const area = EXP_findAreaByName(name)
      if(area) {
        exportGroup.addChild(area);
      } else {
        console.error('未找到区域：', name)
      }
    }
    const svgString = exportGroup.exportSVG({ asString: true });

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  /**
   *
   * @returns {string} 返回整个项目的JSON内容
   */
  function EXP_exportJSON() {
    return scope.project.exportJSON()
  }

  /**
   *
   * @returns {string} 返回整个项目的SVG内容，一般建议用JSON
   */
  function EXP_exportAllSVG() {
    const svgString = project.exportSVG({ asString: true });
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  /**
   * 导入原本之前导出的项目JSON
   * @param exported_json JSON格式的字符串
   */
  function EXP_importJSON(exported_json) {
    scope.activate()
    scope.project.importJSON(exported_json)
    combineLayers()
    bindAllAreaPathEvent()
    EXP_deselectAll()
  }

  function EXP_clearAll() {
    scope.activate()
    scope.project.clear()
    svgConfig.areaWatch = [] // 清空所有事件监听
    EXP_resetDefaultScale()
    createLayers()
  }

  /**
   * 拼合所有的layer，只保持固定的几个layer层，其他的合并
   */
  function combineLayers() {
    function combineLayer(layerName) {
      const layers = scope.project.layers.filter(item => item.name === layerName)
      const toLayer = layers[0]
      for(let i = 1; i < layers.length; i++) {
        const nowLayer = layers[i]
        do{
          toLayer.addChild(nowLayer.children[0])
        }while (nowLayer.children.length > 0)
      }
      for(let i = 1; i < layers.length; i++) {
        layers[i].remove()
      }
    }

    combineLayer(AREA_TYPE_BG)
    combineLayer(AREA_TYPE)
    combineLayer(AREA_TYPE_CUSTOM)
    combineLayer(AREA_TYPE_LINE)
    combineLayer(AREA_TYPE_IMG)
    combineLayer(AREA_TYPE_TEXT)

    // 只保留一个最后的唯一的一个背景图，其他的背景图都删掉
    while(getLayer(AREA_TYPE_BG).children.length > 1) {
      getLayer(AREA_TYPE_BG).children[0].remove()
    }
  }

  function EXP_importSVG(svgString) {
    scope.activate()
    scope.project.importSVG(svgString, {
      onLoad: function(item) {
        console.log('SVG 导入成功:', item);
      },
      onError: function(message) {
        console.error('SVG 导入失败:', message);
      }
    });
  }

  /**
   * 恢复画布的默认缩放
   */
  function EXP_resetDefaultScale() {
    scope.view.zoom = 1
    scope.view.center = new scope.Point(
      (scope.view.bounds.width / 2),
      (scope.view.bounds.height / 2)
    )
  }

  /**
   * 加载背景图，重复加载背景图，将进行替换效果
   * @param imgUrl 图片地址
   * @param callBack 加载完成后的回调
   */
  function EXP_loadBackground(imgUrl, callBack = (image)=> {}) {
    EXP_resetDefaultScale()

    scope.activate()
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      try{
        getLayer(AREA_TYPE_BG).removeChildren() // 删除所有背景图
      }catch (e){}

      const raster = new scope.Raster(image);
      raster.data = {
        area_name: '【唯一背景图】',
        area_type: AREA_TYPE_BG,
      }
      bindPathEvent(raster)
      addToLayer(AREA_TYPE_BG, raster)
      raster.scale(scope.view.bounds.width / raster.width, scope.view.bounds.height / raster.height)
      raster.position = scope.view.center

      callBack(image, raster);
    }
  }

  /**
   * 根据区域名称返回查找区域
   * @param areaName 区域名称
   * @returns {*} 目标区域 | null
   */
  function EXP_findAreaByName(areaName) {
    return EXP_areaGetAll().find(item => item.area_name === areaName)
  }

  /**
   * 根据区域名称删除区域
   * @param areaName 区域名称
   * @returns {boolean} 删除结果True|False
   */
  function EXP_deleteAreaByName(areaName) {
    scope.activate()
    const area = EXP_findAreaByName(areaName)
    if (area){
      area.remove()
      return true
    } else {
      return false;
    }
  }

  /**
   * 改变区域填充颜色
   * @param area_name 区域名称
   * @param toColor 颜色
   * @returns {*} 目标区域
   */
  function EXP_changeAreaFillColor(area_name, toColor) {
    scope.activate()
    const area = EXP_findAreaByName(area_name)
    if (area){
      area.fillColor = toColor
    } else {
      throw new Error('没有预定的区域')
    }
    return area
  }

  /**
   * 绘制图片
   * @param imgUrl 图片地址，本地 或者 远程地址都可以
   * @param x x坐标
   * @param y y坐标
   * @param area_name 区域名称
   * @param callBack 加载完成后的回调
   */
  function EXP_drawImage(imgUrl, x = 50, y = 50, area_name, callBack = (image) => {}) {
    scope.activate()
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      const raster = new scope.Raster(image);
      raster.position = scope.view.center;
      raster.data = {
        area_name: area_name,
        area_type: AREA_TYPE_IMG,
      }
      addToLayer(AREA_TYPE_IMG, raster)
      bindPathEvent(raster)
      raster.areaBind = () => {return 1}
      raster.position = new scope.Point(raster.size.width / 2 + x, raster.size.height / 2 + y)
      callBack(image, raster);
    }
  }

  /**
   * 绘制图片
   * @param imgUrl 图片地址，本地 或者 远程地址都可以
   * @param x x坐标
   * @param y y坐标
   * @param width 显示的宽度
   * @param height 显示的高度
   * @param area_name 区域名称
   * @param callBack 加载完成后的回调
   */
  function EXP_drawImage2(imgUrl, x = 50, y = 50, width = 30, height = 30, area_name, callBack = (image) => {}) {
    scope.activate()
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      const raster = new scope.Raster(image);
      raster.position = scope.view.center;
      raster.data = {
        area_name: area_name,
        area_type: AREA_TYPE_IMG,
      }
      raster.size = new scope.Size(width, height)
      addToLayer(AREA_TYPE_IMG, raster)
      bindPathEvent(raster)
      raster.areaBind = () => {return 1}
      raster.position = new scope.Point(raster.size.width / 2 + x, raster.size.height / 2 + y)
      callBack(image, raster);
    }
  }


  /**
   * 绘制文本
   * @param textStr 文本内容
   * @param x x坐标
   * @param y y坐标
   * @param textName 文本名称
   * @param other_options 其他选项
   * @returns {*} 文本对象
   */
  function EXP_drawText(textStr, x = 50, y = 50, textName, other_options = {}) {
    scope.activate()
    var text = new paper.PointText(Object.assign({
      point: [x, y], // 文本的位置
      content: textStr, // 文本内容
      fillColor: 'black', // 文本颜色
      fontFamily: 'Arial', // 字体
      fontSize: 20, // 字体大小
    }, other_options));
    text.data = {
      area_name: textName,
      area_type: AREA_TYPE_TEXT,
    }
    addToLayer(AREA_TYPE_TEXT, text)
    bindPathEvent(text)
    return text;
  }

  /**
   * 绘制线条
   * @param points 线条坐标点
   * @param lineName 线条名称
   * @param other_options 其他选项
   * @returns {*} 线条对象
   */
  function EXP_drawLine(points = [], lineName = '线条-未命名', other_options = {}) {
    scope.activate()
    const path = new scope.Path(Object.assign({
      segments: points,
      strokeColor: 'black',
      fullySelected: true,
    }, other_options))
    path.data = {
      area_name: lineName,
      area_type: AREA_TYPE_LINE,
    }
    addToLayer(AREA_TYPE_LINE, path)
    bindPathEvent(path)
    return path;
  }

  /**
   * 区域线条绘制
   * @param areaNames 区域名称['A', 'B', 'C']
   * @param lineName 绘制的线条的名称
   * @param other_options 其他选项
   * @returns {*} 区域对象
   */
  function EXP_drawAreaLine(areaNames, lineName = '线条-未命名', other_options = {}) {
    scope.activate()
    const areas = areaNames.map(item => {
      const area = EXP_findAreaByName(item)
      if (!area) {
        throw new Error('没有这个区域')
      }
      return area
    })
    if(areas.length > 1) {
      const path = new scope.Path(Object.assign({
        segments: areas.map(item => {
          return {
            x: item.bounds.left + item.bounds.width / 2,
            y: item.bounds.top + item.bounds.height / 2
          }
        }),
        strokeColor: 'black',
        fullySelected: true,
      }, other_options))
      path.data = {
        area_name: lineName,
        area_type: AREA_TYPE_LINE,
      }
      addToLayer(AREA_TYPE_LINE, path)
      bindPathEvent(path)
      return path
    }
  }

  /**
   * 对于所有元素，绑定事件
   */
  function bindAllAreaPathEvent() {
    EXP_areaGetAll().forEach(item => {
      if (!item.area_type && !item.hasBindEvent) {
        item.hasBindEvent = true
        bindPathEvent(item)
      }
    })
  }

  /**
   * 绑定目标区域的事件触发
   * @param path 目标区域
   */
  function bindPathEvent(path) {
    for(const name in path.data) {
      path[name] = path.data[name]
    }
    if(!path.area_type) return // 并非自定义的元素
    ~(function(newPath){
      // 绑定path事件
      newPath.on('click', pathMouseClickEvent)
      newPath.on('mouseenter', pathMouseHoverEvent)
      newPath.on('mouseleave', pathMouseOutEvent)
      newPath.on('mousemove', pathMouseMoveEvent)
      newPath.on('doubleclick', () => {
        EXP_deselectAll()
      })

      function pathMouseClickEvent(event) {
        svgConfig.areaWatch.filter(one => one.watchEvent === 'click').map(item => {
          item.callback(event, newPath)
        })
      }

      function pathMouseHoverEvent(event) {
        svgConfig.areaWatch.filter(one => one.watchEvent === 'mouseenter').map(item => {
          item.callback(event, newPath)
        })
      }
      function pathMouseOutEvent(event) {
        svgConfig.areaWatch.filter(one => one.watchEvent === 'mouseleave').map(item => {
          item.callback(event, newPath)
        })
      }
      function pathMouseMoveEvent(event) {
        svgConfig.areaWatch.filter(one => one.watchEvent === 'mousemove').map(item => {
          item.callback(event, newPath)
        })
      }
    })(path)
  }

  /**
   * 开始绘制区域
   * @param area_name 区域名称
   * @param fillColor 填充颜色
   * @param other_options 其他选项
   * @returns {Promise<unknown>}
   */
  function EXP_startDraw(area_name = '区域-未命名', fillColor = undefined, other_options = {}) {
    scope.activate()
    var path = new scope.Path({
      strokeColor: 'black',
      fullySelected: true
    });

    let selectedSegment = null
    let resolve = null

    const promise = new Promise((__resolve) => {
      resolve = __resolve
    });

    svgConfig.tool.on('mousedown', mouseDown)
    svgConfig.tool.on('mousedrag', mouseDrag)
    svgConfig.tool.on('mouseup', mouseUp)

    function mouseDown(event) {
      if (path) {
        path.selected = true;
      }
      selectedSegment = null;
      for (var i = 0; i < path.segments.length; i++) {
        var segment = path.segments[i];
        var distance = segment.point.getDistance(event.point);
        if (distance < 5) { // Adjust the threshold as needed
          selectedSegment = segment;
          console.log('有选中的呢')
          break;
        }
      }

      if (!selectedSegment) {
        path = new scope.Path(Object.assign({
          segments: [event.point],
          strokeColor: 'black',
          fullySelected: true
        }, other_options));
      }
    }

    function mouseDrag(event) {
      if (selectedSegment) {
        selectedSegment.point = event.point;
        path.smooth();
      } else {
        path.add(event.point);
      }
    }

    function mouseUp() {
      if (!selectedSegment) {
        path.simplify(6);
        path.fullySelected = true;
        path.closed = true;
        path.smooth();
        path.data = {
          area_name: area_name,
          area_type: AREA_TYPE,
        }
        addToLayer(AREA_TYPE, path)
        path.areaBind = () => {return 1}

        var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
        var hue = Math.random() * 360;
        path.fillColor = fillColor || { hue: hue, saturation: 1, lightness: lightness, alpha: 0.3 };

        // 解除原绘制事件
        svgConfig.tool.off('mousedown', mouseDown)
        svgConfig.tool.off('mousedrag', mouseDrag)
        svgConfig.tool.off('mouseup', mouseUp)

        bindPathEvent(path)
        resolve(path)
      }
    }
    return promise
  }

  /**
   * 开始绘制区域
   * @param area_name 区域名称
   * @param fillColor 填充颜色
   * @param other_options 其他选项
   * @returns {Promise<unknown>}
   */
  function EXP_startDrawArea(area_name = '区域-未命名', fillColor = undefined, other_options) {
    scope.activate()
    var areaPath = new scope.Path(Object.assign({
      segments: [],
      strokeColor: 'black',
      fullySelected: true,
    }, other_options));

    const _pathList = []

    let resolve = null

    const promise = new Promise((__resolve) => {
      resolve = __resolve
    });

    svgConfig.tool.on('mouseup', mouseUp)
    svgConfig.tool.on('mousemove', mouseMove)
    svgConfig.tool.on('keyup', keyUp)

    function mouseUp(event) {
      const curPoint = new scope.Point(event.point);
      areaPath.add(curPoint);
      _pathList.push(curPoint)

      if(_pathList.length === 1) {
        // 第一次的时候
        const tmpP = new scope.Point(event.point);
        areaPath.add(tmpP);
        _pathList.push(tmpP)
      }

      // 如果点击靠近第一个点，闭合路径
      if (_pathList.length > 2 && curPoint.getDistance(areaPath.segments[0].point) < 10) {
        _pathList.length = 0
        finish()
      }

      // 禁止出现曲线
      for(const seg of areaPath.segments) {
        const inP = seg['handleIn']
        const outP = seg['handleOut']
        if(inP) {
          inP.x = 0
          inP.y = 0
        }
        if(outP) {
          outP.x = 0
          outP.y = 0
        }
      }
    }

    function mouseMove(event) {
      const lastP = areaPath.segments[areaPath.segments.length - 1]
      if(lastP) {
        lastP.point.x = event.point.x;
        lastP.point.y = event.point.y;
      }
    }

    function keyUp(event) {
      if (event.key === 'escape') {
        areaPath.remove() // 停止绘制
      }
    }

    function finish(){
      areaPath.fullySelected = true;
      areaPath.closed = true;
      areaPath.data = {
        area_name: area_name,
        area_type: AREA_TYPE,
      }
      addToLayer(AREA_TYPE, areaPath)
      areaPath.areaBind = () => {return 1}

      var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
      var hue = Math.random() * 360;

      areaPath.fillColor = fillColor || { hue: hue, saturation: 1, lightness: lightness, alpha: 0.3 };

      // 解除原绘制事件
      svgConfig.tool.off('mouseup', mouseUp)
      svgConfig.tool.off('mousemove', mouseMove)

      bindPathEvent(areaPath)
      resolve(areaPath)

    }
    return promise
  }

  function EXP_enableDragMoveBg() {
    svgConfig.dragMoveBgEnable = true
  }

  function EXP_disableDragMoveBg() {
    svgConfig.dragMoveBgEnable = false
  }

  // 初始化拖动、移动背景功能
  function bindDragMove(canvasTarget) {

    // 初始化变量
    let offsetX = 0; // X轴偏移量
    let offsetY = 0; // Y轴偏移量
    let isDragging = false; // 是否正在拖动
    let lastX, lastY, firstX, firstY; // 上一次鼠标的位置

    // 监听滚轮事件
    canvasTarget.addEventListener('wheel', function(event) {
      if(!svgConfig.dragMoveBgEnable) return

      // 获取鼠标在视图中的位置
      const mousePos = scope.view.viewToProject(new scope.Point(event.clientX, event.clientY));

      if (event.deltaY < 0) { // 滚轮向上滚动
        svgConfig.curDrawScale = Math.min(svgConfig.curDrawScale * 1.1, svgConfig.dragMoveOptions.maxScale);
      } else { // 滚轮向下滚动
        svgConfig.curDrawScale = Math.max(svgConfig.curDrawScale / 1.1, svgConfig.dragMoveOptions.minScale);
      }

      // 计算新的中心点
      const oldCenter = scope.view.center;
      const newCenter = oldCenter.add(mousePos.subtract(oldCenter).multiply(1 - 1 / svgConfig.curDrawScale));

      // 更新视图缩放和中心点
      scope.view.zoom = svgConfig.curDrawScale;
      scope.view.center = newCenter;

      // 阻止默认行为
      event.preventDefault();
    }, { passive: false });

    // 当缩放恢复到1时，重置偏移量
    canvasTarget.addEventListener('wheel', function(event) {
      if(!svgConfig.dragMoveBgEnable) return
      svgConfig.areaWatch.filter(one => one.watchEvent === 'wheel').map(item => {
        item.callback(event)
      })
      if (svgConfig.curDrawScale === svgConfig.dragMoveOptions.minScale) {
        offsetX = 0;
        offsetY = 0;
        scope.view.center = new scope.Point(
          (scope.view.bounds.width / 2),
          (scope.view.bounds.height / 2)
        );
      }
    });

    // 监听鼠标按下事件
    canvasTarget.addEventListener('mousedown', function(event) {
      if(!svgConfig.dragMoveBgEnable) return
      svgConfig.curDrawCenter = scope.view.center

      if (svgConfig.curDrawScale > svgConfig.dragMoveOptions.minScale) {
        isDragging = true;
        firstX = event.clientX;
        firstY = event.clientY;
      }
    });

    // 监听鼠标移动事件
    canvasTarget.addEventListener('mousemove', function(event) {
      if(!svgConfig.dragMoveBgEnable) return
      if(isDragging) {
        svgConfig.areaWatch.filter(one => one.watchEvent === 'dragmove').map(item => {
          item.callback(event)
        })
      }
      if (isDragging && svgConfig.curDrawScale > svgConfig.dragMoveOptions.minScale) {
        offsetX = (firstX - event.clientX) / svgConfig.curDrawScale;
        offsetY = (firstY - event.clientY) / svgConfig.curDrawScale;

        // 边界检查
        const viewBounds = scope.view.bounds;
        const contentBounds = getLayer(AREA_TYPE_BG).bounds;

        // 计算新的中心点
        let newCenterX = svgConfig.curDrawCenter.x + offsetX;
        let newCenterY = svgConfig.curDrawCenter.y + offsetY;

        // 边界检查
        if (newCenterX - viewBounds.width / 2 < contentBounds.x) {
          newCenterX = contentBounds.x + viewBounds.width / 2;
        } else if (newCenterX + viewBounds.width / 2 > contentBounds.x + contentBounds.width) {
          newCenterX = contentBounds.x + contentBounds.width - viewBounds.width / 2;
        }

        if (newCenterY - viewBounds.height / 2 < contentBounds.y) {
          newCenterY = contentBounds.y + viewBounds.height / 2;
        } else if (newCenterY + viewBounds.height / 2 > contentBounds.y + contentBounds.height) {
          newCenterY = contentBounds.y + contentBounds.height - viewBounds.height / 2;
        }

        // 更新视图中心点
        scope.view.center = new scope.Point(newCenterX, newCenterY);

        lastX = event.clientX;
        lastY = event.clientY;
      }
    });

    canvasTarget.addEventListener('mouseup', function() {
      if(!svgConfig.dragMoveBgEnable) return
      isDragging = false;
      svgConfig.curDrawCenter.x = scope.view.center.x;
      svgConfig.curDrawCenter.y = scope.view.center.y;
    });
  }

  function getLayer(findName) {
    return scope.project.layers.find(one => one.name === findName)
  }

  function addToLayer(findName, item) {
    try{
      getLayer(findName).addChild(item)
      svgConfig.areaList.push(item)
      return true
    } catch (e) {
      return false
    }
  }

  function init(myConfig  = {}) {
    if(isInitialized) {
      throw new Error('只允许初始化一次，因为涉及了多个事件绑定和初始化')
    }
    svgConfig = Object.assign(svgConfig, myConfig)
    const canvas = document.querySelector(svgConfig.canvasSelector)
    scope.setup(canvas)
    svgConfig.tool.on('mousedown', onMouseDown)
    svgConfig.tool.on('mousedrag', onMouseDrag)
    svgConfig.tool.on('mouseup', onMouseUp)
    svgConfig.tool.on('keydown', onKeyDown)

    createLayers()

    svgConfig.history = new HistoryStack()
    bindDragMove(canvas)
    isInitialized = true
  }

  function createLayers() {
    createLayer(AREA_TYPE_BG)
    createLayer(AREA_TYPE)
    createLayer(AREA_TYPE_CUSTOM)
    createLayer(AREA_TYPE_LINE)
    createLayer(AREA_TYPE_IMG)
    createLayer(AREA_TYPE_TEXT)
  }

  function createLayer(layerName) {
    const layer = new scope.Layer()
    layer.name = layerName
    scope.project.addLayer(layer)
  }

  return {
    svgConfig,
    svgPainter: this,
    EXP_init: init,
    bindPathEvent,
    EXP_areaEvent,
    EXP_areaGetAll,
    EXP_drawLine,
    EXP_drawAreaLine,
    EXP_startDraw,
    EXP_startDrawArea,
    EXP_drawImage,
    EXP_drawImage2,
    EXP_drawText,

    EXP_enableDragMoveBg,
    EXP_disableDragMoveBg,
    EXP_exportJSON,
    EXP_exportAllSVG,
    EXP_exportAreaSVG,
    EXP_importJSON,
    EXP_resetDefaultScale,
    EXP_clearAll,
    EXP_importSVG,
    EXP_addCustomShape,
    EXP_loadBackground,
    EXP_changeAreaFillColor,
    EXP_findAreaByName,
    EXP_deleteAreaByName,
    EXP_deselectAll,
    EXP_getLayer: getLayer,
  }
}
