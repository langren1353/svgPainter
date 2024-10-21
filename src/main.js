/***
 * 注意这种PaperScript的写法（可以用普通js替代，区别在于调用paper下的字对象是否需要加paper，以及向量的加减乘除-需要用函数调用了，不能是+-*）：
 *  不支持const、let
 *  不支持lambda表达式写法
 */
import paper from 'paper';

export default function() {
  const AREA_TYPE = '自定义';
  const scope = new paper.PaperScope()
  
  let svgConfig = {
    scope,
    canvasSelector: '#myCanvas',
    tool: new scope.paper.Tool(),
    drawEnable: false,
    history: null,
    hitOptions: {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: 5
    },
    areaWatch: [],
  }

  class HistoryStack {
    constructor() {
      this.pointsStack = []
      this.index = -1

      // 监听scope.paper.project.activeLayer.children，如果有变更，那么调用一次save方法
      const watchChildProxy = new Proxy(scope.paper.project, {
        set: (target, property, value, receiver) => {
          const result = Reflect.set(target, property, value, receiver);
          return result;
        },
        deleteProperty: (target, property) => {
          const result = Reflect.deleteProperty(target, property);
          return result;
        }
      });
      scope.paper.project = watchChildProxy;
    }

    // 主要调用这个
    save() {

      if (this.index < this.pointsStack.length - 1) {
        this.pointsStack = this.pointsStack.slice(0, this.index + 1)
      }
      if (this.pointsStack.length >= 20) {
        this.pointsStack.shift()
      }
      const curJSON = scope.paper.project.exportJSON()
      const lastJSON = this.pointsStack[this.index]
      if (curJSON !== lastJSON) {
        console.log('调用了save')
        this.push(scope.paper.project.exportJSON())
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
        scope.paper.project.clear()
        scope.paper.project.importJSON(this.pointsStack[this.index])
        return this.pointsStack[this.index]
      }
      return null
    }

    redo() {
      if (this.index < this.pointsStack.length - 1)
        this.index++

      console.log('调用了redo')
      scope.paper.project.clear()
      scope.paper.project.importJSON(this.pointsStack[this.index])
      return this.pointsStack[this.index]
    }
  }

  var choosePoint, activeShape;

  function onMouseDown(event) {
    choosePoint = activeShape = null;
    var hitResult = scope.paper.project.hitTest(event.point, svgConfig.hitOptions);
    if (!hitResult)
      return;

    if (event.modifiers.shift) {
      if (hitResult.type === 'segment') {
        hitResult.segment.remove();
        svgConfig.history.save()
      }
    }

    if (hitResult) {
      activeShape = hitResult.item;
      console.log('点击了：' + (activeShape.area_name || hitResult.type))

      if (hitResult.type === 'pixel') { // 跳过图片处理
        choosePoint = null;
        activeShape = null;
      } else if (hitResult.type === 'segment') { // 点位
        choosePoint = hitResult.segment;
      } else if (hitResult.type === 'stroke') { // 线条
        const location = hitResult.location;
        choosePoint = activeShape.insert(location.index + 1, event.point);
        activeShape.smooth();
        svgConfig.history.save()
      } else if (hitResult.type === 'fill') { // 填充的图像
        scope.paper.project.activeLayer.selected = false;
        hitResult.item.selected = true;
        scope.paper.project.activeLayer.addChild(hitResult.item);
      }
    }
  }

  function onMouseDrag(event) {
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
    return scope.paper.project.activeLayer.children.filter(item => item.area_type && item.area_type === AREA_TYPE)
  }

  function EXP_deselectAll() {
    scope.paper.project.activeLayer.selected = false;
  }

  // 导出多项为SVG
  function EXP_exportAreaSVG(area_names) {
    const exportGroup = new scope.paper.Group();
    for (var name in item_names) {
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
    return scope.paper.project.exportJSON()
  }

  // 导出为 SVG 字符串
  function EXP_exportAllSVG() {
    const svgString = project.exportSVG({ asString: true });
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  function EXP_importJSON(exported_json) {
    scope.paper.project.importJSON(exported_json)
  }
  
  function EXP_importSVG(svgString) {
    scope.paper.project.importSVG(svgString, {
      onLoad: function(item) {
        console.log('SVG 导入成功:', item);
      },
      onError: function(message) {
        console.error('SVG 导入失败:', message);
      }
    });
  }

  function EXP_loadBackground(imgUrl, callBack = ()=> {}) {
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      const raster = new scope.paper.Raster(image);
      raster.position = scope.paper.view.center;
      callBack(image);
    }
  }

  function EXP_findAreaByName(areaName) {
    return scope.paper.project.activeLayer.children.find(item => item.area_name === areaName)
  }
  
  function EXP_changeAreaFillColor(areaName, toColor) {
    const area = EXP_findAreaByName(areaName)
    if (area){
      area.fillColor = toColor
    } else {
      throw new Error('没有预定的区域')
    }
    return area
  }

  function EXP_drawImage(imgUrl, x = 50, y = 50, imgName, callBack = () => {}) {
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      const raster = new scope.paper.Raster(image);
      raster.position = scope.paper.view.center;
      raster.area_name = imgName
      raster.position = new scope.paper.Point(raster.size.width / 2 + x, raster.size.height / 2 + y)
      callBack(image);
    }
  }
  function EXP_drawText(textStr, x = 50, y = 50, textName, other_options = {}) {
    var text = new paper.PointText(Object.assign({
      point: [x, y], // 文本的位置
      content: textStr, // 文本内容
      fillColor: 'black', // 文本颜色
      fontFamily: 'Arial', // 字体
      fontSize: 20, // 字体大小
      area_name: textName
    }, other_options));
    text.bringToFront();
    return text;
  }
  
  function EXP_drawLine(points = [], lineName = '线条-未命名', other_options = {}) {
    return new scope.paper.Path(Object.assign({
      segments: points,
      strokeColor: 'black',
      fullySelected: true,
      area_name: lineName,
    }, other_options))
  }
  
  function EXP_drawAreaLine(areaNames, lineName = '线条-未命名', other_options = {}) {
    const areas = areaNames.map(item => {
      const area = EXP_findAreaByName(item)
      if (!area) {
        throw new Error('没有这个区域')
      }
      return area
    })
    if(areas.length > 1) {
      return new scope.paper.Path(Object.assign({
        segments: areas.map(item => {
          return {
            x: item.bounds.left + item.bounds.width / 2,
            y: item.bounds.top + item.bounds.height / 2
          }
        }),
        strokeColor: 'black',
        fullySelected: true,
        area_name: lineName,
      }, other_options))
    }
  }

  // 绘制，返回Promise，resolve为路径
  function EXP_startDraw(drawName = '区域-未命名', fillColor = undefined, other_options) {
    svgConfig.drawEnable = true

    var path = new scope.paper.Path({
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
      if (!svgConfig.drawEnable) return
      console.log(svgConfig.drawEnable)
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
        path = new scope.paper.Path(Object.assign({
          segments: [event.point],
          strokeColor: 'black',
          fullySelected: true
        }, other_options));
      }
    }

    function mouseDrag(event) {
      if (!svgConfig.drawEnable) return

      if (selectedSegment) {
        selectedSegment.point = event.point;
        path.smooth();
      } else {
        path.add(event.point);
      }
    }

    function mouseUp(event) {
      if (!selectedSegment) {
        if (!svgConfig.drawEnable) return

        path.simplify(6);
        path.fullySelected = true;
        path.closed = true;
        path.smooth();
        path.area_name = drawName;
        path.area_type = AREA_TYPE;

        var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
        var hue = Math.random() * 360;
        path.fillColor = fillColor || { hue: hue, saturation: 1, lightness: lightness, alpha: 0.3 };

        // 只让画一次
        svgConfig.drawEnable = false;

        // 解除原绘制事件
        svgConfig.tool.off('mousedown', mouseDown)
        svgConfig.tool.off('mousedrag', mouseDrag)
        svgConfig.tool.off('mouseup', mouseUp)

        ~(function(newPath){
          console.log(newPath.area_name)
          // 绑定path事件
          newPath.on('click', pathMouseClickEvent)
          newPath.on('mouseenter', pathMouseHoverEvent)
          newPath.on('mouseleave', pathMouseOutEvent)
          newPath.on('mousemove', pathMouseMoveEvent)
          newPath.on('doubleclick', () => {
            EXP_deselectAll()
          })

          function pathMouseClickEvent(event) {
            for (const item of svgConfig.areaWatch) {
              if (item.watchEvent === 'click') {
                item.callback(event, newPath)
              }
            }
          }

          function pathMouseHoverEvent(event) {
            for (const item of svgConfig.areaWatch) {
              if (item.watchEvent === 'mouseenter') {
                item.callback(event, newPath)
              }
            }
          }
          function pathMouseOutEvent(event) {
            for (const item of svgConfig.areaWatch) {
              if (item.watchEvent === 'mouseleave') {
                item.callback(event, newPath)
              }
            }
          }
          function pathMouseMoveEvent(event) {
            for (const item of svgConfig.areaWatch) {
              if (item.watchEvent === 'mousemove') {
                item.callback(event, newPath)
              }
            }
          }
        })(path)

        resolve(path)
      }
    }
    return promise
  }

  function init(myConfig  = {}) {
    svgConfig = Object.assign(svgConfig, myConfig)
    scope.paper.setup(document.querySelector(svgConfig.canvasSelector))
    svgConfig.tool.on('mousedown', onMouseDown)
    svgConfig.tool.on('mousedrag', onMouseDrag)
    svgConfig.tool.on('mouseup', onMouseUp)
    svgConfig.tool.on('keydown', onKeyDown)

    svgConfig.history = new HistoryStack()
  }
  
  return {
    svgConfig,
    svgPainter: this,
    EXP_init: init,
    EXP_areaEvent,
    EXP_areaGetAll,
    EXP_drawLine,
    EXP_drawAreaLine,
    EXP_startDraw,
    EXP_drawImage,
    EXP_drawText,
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
