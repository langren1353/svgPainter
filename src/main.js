/***
 * 注意这种PaperScript的写法（可以用普通js替代，区别在于调用paper下的字对象是否需要加paper，以及向量的加减乘除-需要用函数调用了，不能是+-*）：
 *  不支持const、let
 *  不支持lambda表达式写法
 */

import paper from 'paper'

window.paper = paper

window.svgPainter = (function() {
  window.svgConfig = Object.assign({
    canvasSelector: '#myCanvas',
    tool: new paper.Tool(),
    drawEnable: false,
    history: null,
    hitOptions: {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: 5
    },
    areaWatch: [],
  }, window.svgConfig)

  class HistoryStack {
    constructor() {
      this.pointsStack = []
      this.index = -1

      // 监听paper.project.activeLayer.children，如果有变更，那么调用一次save方法
      const watchChildProxy = new Proxy(paper.project, {
        set: (target, property, value, receiver) => {
          const result = Reflect.set(target, property, value, receiver);
          return result;
        },
        deleteProperty: (target, property) => {
          const result = Reflect.deleteProperty(target, property);
          return result;
        }
      });
      paper.project = watchChildProxy;
    }

    // 主要调用这个
    save() {

      if (this.index < this.pointsStack.length - 1) {
        this.pointsStack = this.pointsStack.slice(0, this.index + 1)
      }
      if (this.pointsStack.length >= 20) {
        this.pointsStack.shift()
      }
      const curJSON = paper.project.exportJSON()
      const lastJSON = this.pointsStack[this.index]
      if (curJSON !== lastJSON) {
        console.log('调用了save')
        this.push(paper.project.exportJSON())
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
        paper.project.clear()
        paper.project.importJSON(this.pointsStack[this.index])
        return this.pointsStack[this.index]
      }
      return null
    }

    redo() {
      if (this.index < this.pointsStack.length - 1)
        this.index++

      console.log('调用了redo')
      paper.project.clear()
      paper.project.importJSON(this.pointsStack[this.index])
      return this.pointsStack[this.index]
    }
  }

  var choosePoint, activeShape;

  function onMouseDown(event) {
    choosePoint = activeShape = null;
    var hitResult = paper.project.hitTest(event.point, svgConfig.hitOptions);
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
      console.log('点击了：' + (activeShape.name || hitResult.type))

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
        paper.project.activeLayer.selected = false;
        hitResult.item.selected = true;
        paper.project.activeLayer.addChild(hitResult.item);
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

  function EXP_AreaEvent(event, callback) {
    svgConfig.areaWatch.push({
      watchEvent: event,
      callback: callback
    })
  }

  function EXP_deselectAll() {
    paper.project.activeLayer.selected = false;
  }

  // 添加svg元素
  function EXP_addPath(pathStr) {

  }

  // 导出多项为SVG
  function EXP_exportItems(items) {
    const exportGroup = new Group();
    for (var item in items) {
      exportGroup.addChild(item);
    }
    const svgString = exportGroup.exportSVG({ asString: true });

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  // 导出为 SVG 字符串
  function EXP_exportAll() {
    const svgString = project.exportSVG({ asString: true });
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  function EXP_importSVG(svgString) {
    paper.project.importSVG(svgString, {
      onLoad: function(item) {
        console.log('SVG 导入成功:', item);
      },
      onError: function(message) {
        console.error('SVG 导入失败:', message);
      }
    });
  }

  function EXP_loadBackground(imgUrl, callBack) {
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => callBack(image);
  }

  // 绘制，返回Promise，resolve为路径
  function EXP_startDraw(drawName = '区域-未命名') {
    svgConfig.drawEnable = true

    var path = new paper.Path({
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
        path = new paper.Path({
          segments: [event.point],
          strokeColor: 'black',
          fullySelected: true
        });
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
        path.name = drawName;

        var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
        var hue = Math.random() * 360;
        path.fillColor = { hue: hue, saturation: 1, lightness: lightness, alpha: 0.3 };

        // 只让画一次
        svgConfig.drawEnable = false;
        
        // 解除原绘制事件
        svgConfig.tool.off('mousedown', mouseDown)
        svgConfig.tool.off('mousedrag', mouseDrag)
        svgConfig.tool.off('mouseup', mouseUp)

        ~(function(newPath){
          console.log(newPath.name)
          // 绑定path事件
          newPath.on('click', pathClickEvent)
          newPath.on('mouseenter', pathHoverEvent)
          newPath.on('mouseleave', pathOutEvent)

          function pathClickEvent(event) {
            for (const item of svgConfig.areaWatch) {
              if (item.watchEvent === 'click') {
                item.callback(event, newPath)
              }
            }
          }

          function pathHoverEvent(event) {
            for (const item of svgConfig.areaWatch) {
              if (item.watchEvent === 'mouseenter') {
                item.callback(event, newPath)
              }
            }
          }
          function pathOutEvent(event) {
            for (const item of svgConfig.areaWatch) {
              if (item.watchEvent === 'mouseleave') {
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

  function init() {
    paper.setup(document.querySelector(window.svgConfig.canvasSelector))
    svgConfig.tool.on('mousedown', onMouseDown)
    svgConfig.tool.on('mousedrag', onMouseDrag)
    svgConfig.tool.on('mouseup', onMouseUp)
    svgConfig.tool.on('keydown', onKeyDown)

    svgConfig.history = new HistoryStack()
  }

  init()

  return {
    EXP_AreaEvent,
    EXP_startDraw,
    EXP_addPath,
    EXP_exportItems,
    EXP_exportAll,
    EXP_importSVG,
    EXP_loadBackground,
    EXP_deselectAll
  }
})()
