/***
 * 注意这种PaperScript的写法（可以用普通js替代，区别在于调用paper下的字对象是否需要加paper，以及向量的加减乘除-需要用函数调用了，不能是+-*）：
 *  不支持const、let
 *  不支持lambda表达式写法
 */
import paper from 'paper/dist/paper-core';

export default function() {
  const AREA_TYPE = '自定义';
  const AREA_TYPE_IMG = '图像';
  const AREA_TYPE_LINE = '线条';
  const AREA_TYPE_TEXT = '文字';
  const scope = new paper.PaperScope()
  
  let svgConfig = {
    scope,
    canvasSelector: '#myCanvas',
    tool: new scope.Tool(),
    drawEnable: false, // 是否绘制模式：用于修改已绘制的元素
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
    level_background: null,
    level_imageIcon: null,
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
        console.log('调用了save')
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
    
    // 绘制的模式时，才可以修改
    if(!svgConfig.drawEnable) return;

    if (event.modifiers.shift) {
      if (hitResult.type === 'segment') {
        hitResult.segment.remove();
        svgConfig.history.save()
      }
    }
    
    if (hitResult.type === 'pixel') { // 跳过图片处理
      if(activeShape.area_type) {
        scope.project.activeLayer.selected = false;
        hitResult.item.selected = true;
      } else {
        choosePoint = null;
        activeShape = null;
      }
    } else if (hitResult.type === 'segment') { // 点位
      choosePoint = hitResult.segment;
    } else if (hitResult.type === 'stroke') { // 线条
      const location = hitResult.location;
      choosePoint = activeShape.insert(location.index + 1, event.point);
      activeShape.smooth();
      svgConfig.history.save()
    } else if (hitResult.type === 'fill') { // 填充的图像
      scope.project.activeLayer.selected = false;
      hitResult.item.selected = true;
    }
  }

  function onMouseDrag(event) {
    // 绘制的模式时，才可以修改
    if(!svgConfig.drawEnable) return;
    
    if (choosePoint) { // 增加点位
      choosePoint.point = choosePoint.point.add(event.delta);
      activeShape.smooth();
    } else if (activeShape) { // 移动路径
      activeShape.position = activeShape.position.add(event.delta);
    }
  }

  function onMouseUp(event) {
    if (choosePoint || activeShape) { // 增加点位
      svgConfig.history.save()
    }
  }

  function onKeyDown({ event }) {
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
    // 返回所有具有area_type的属性，包括图片、包括自绘制
    return scope.project.activeLayer.children.filter(item => item.area_type)
  }

  function EXP_deselectAll() {
    scope.activate()
    scope.project.activeLayer.selected = false;
  }

  // 导出多项为SVG
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
  
  function EXP_exportJSON() {
    return scope.project.exportJSON()
  }

  // 导出为 SVG 字符串
  function EXP_exportAllSVG() {
    const svgString = project.exportSVG({ asString: true });
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  function EXP_importJSON(exported_json) {
    scope.activate()
    scope.project.importJSON(exported_json)
    bindAreaPathEvent()
    EXP_deselectAll()
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

  function EXP_loadBackground(imgUrl, callBack = ()=> {}) {
    scope.activate()
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      const raster = new scope.Raster(image);

      if(!svgConfig.level_background) {
        svgConfig.level_background = raster
      } else {
        raster.remove()
      }
      
      raster.scale(scope.view.bounds.width/ raster.width, scope.view.bounds.height/raster.height)
      
      raster.position = scope.view.center;
      raster.insertBelow(scope.project.activeLayer);
      callBack(image);
    }
  }

  function EXP_findAreaByName(areaName) {
    return scope.project.activeLayer.children.find(item => item.area_name === areaName)
  }
  
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

  function EXP_drawImage(imgUrl, x = 50, y = 50, area_name, callBack = () => {}) {
    scope.activate()
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      const raster = new scope.Raster(image);
      if(!svgConfig.level_imageIcon) {
        svgConfig.level_imageIcon = raster
      }
      raster.position = scope.view.center;
      raster.data = {
        area_name: area_name,
        area_type: AREA_TYPE_IMG,
      }
      for(const name in raster.data) {
        raster[name] = raster.data[name]
      }
      bindPathEvent(raster)
      raster.areaBind = () => {return 1}
      raster.position = new scope.Point(raster.size.width / 2 + x, raster.size.height / 2 + y)
      raster.bringToFront()
      callBack(image);
    }
  }
  
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
    for(const name in text.data) {
      text[name] = text.data[name]
    }
    bindPathEvent(text)
    text.bringToFront();
    return text;
  }
  
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
    for(const name in path.data) {
      path[name] = path.data[name]
    }
    bindPathEvent(path)
    path.insertBelow(svgConfig.level_imageIcon);
    return path;
  }
  
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
      bindPathEvent(path)
      for(const name in path.data) {
        path[name] = path.data[name]
      }
      path.insertBelow(svgConfig.level_imageIcon);
      return path
    }
  }
  
  function bindAreaPathEvent() {
    scope.project.activeLayer.children.forEach(item => {
      if (!item.area_type) {
        for(const name in item.data) {
          item[name] = item.data[name]
        }
        
        // 如果是应该有事件的地方，那么绑定事件，否则就是不应该有事件的地方：例如背景图
        if (item.area_type) {
          bindPathEvent(item)
        }
      }
    })
  }
  
  function bindPathEvent(path) {
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

  // 绘制，返回Promise，resolve为路径
  function EXP_startDraw(area_name = '区域-未命名', fillColor = undefined, other_options) {
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
        path.insertAbove(svgConfig.level_background);
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

    function mouseUp(event) {
      if (!selectedSegment) {

        path.simplify(6);
        path.fullySelected = true;
        path.closed = true;
        path.smooth();
        path.data = {
          area_name: area_name,
          area_type: AREA_TYPE,
        }
        for(const name in path.data) {
          path[name] = path.data[name]
        }
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
  
  function EXP_enableDragMoveBg() {
    svgConfig.dragMoveBgEnable = true
  }
  
  function EXP_disableDragMoveBg() {
    svgConfig.dragMoveBgEnable = false
  }
  
  // 初始化拖动、移动背景功能
  function bindDragMove(canvasTarget) {
    svgConfig.curDrawCenter = scope.view.center
    
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
        const contentBounds = scope.project.activeLayer.bounds;

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

  function init(myConfig  = {}) {
    svgConfig = Object.assign(svgConfig, myConfig)
    const canvas = document.querySelector(svgConfig.canvasSelector)
    scope.setup(canvas)
    svgConfig.tool.on('mousedown', onMouseDown)
    svgConfig.tool.on('mousedrag', onMouseDrag)
    svgConfig.tool.on('mouseup', onMouseUp)
    svgConfig.tool.on('keydown', onKeyDown)

    svgConfig.history = new HistoryStack()
    bindDragMove(canvas)
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
    EXP_drawImage,
    EXP_drawText,

    EXP_enableDragMoveBg,
    EXP_disableDragMoveBg,
    EXP_exportJSON,
    EXP_exportAllSVG,
    EXP_exportAreaSVG,
    EXP_importJSON,
    EXP_importSVG,
    EXP_loadBackground,
    EXP_changeAreaFillColor,
    EXP_findAreaByName,
    EXP_deselectAll
  }
}
