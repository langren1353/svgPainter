import paper from 'paper'

function createPaths() {
  function createBlob(center, maxRadius, points) {
    var path = new paper.Path();
    path.closed = true;
    for (var i = 0; i < points; i++) {
      var delta = new paper.Point({
        length: (maxRadius * 0.5) + (Math.random() * maxRadius * 0.5),
        angle: (360 / points) * i
      });
      path.add(center.add(delta));
    }
    path.smooth();
    return path;
  }

  var values = {
    paths: 3,
    minPoints: 5, // 最少多少个点
    maxPoints: 15, // 最多多少个点
    minRadius: 30, // 最小间距-半径
    maxRadius: 90   // 最大间距-半径
  };

  var radiusDelta = values.maxRadius - values.minRadius;
  var pointsDelta = values.maxPoints - values.minPoints;
  for (var i = 0; i < values.paths; i++) {
    var radius = values.minRadius + Math.random() * radiusDelta;
    var points = values.minPoints + Math.floor(Math.random() * pointsDelta);
    var path = createBlob(paper.view.size.multiply(paper.Point.random()), radius, points);
    var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
    var hue = Math.random() * 360;
    path.fillColor = { hue: hue, saturation: 1, lightness: lightness, alpha: 0.3 };
    path.strokeColor = 'black';
  }
  paper.view.update()
}

window.svgPainter.EXP_loadBackground('cat.jpg', async function(image) {
  const raster = new paper.Raster(image);
  raster.position = paper.view.center;

  // 手动绘制区域
  await window.svgPainter.EXP_startDraw('区域-头部')
  await window.svgPainter.EXP_startDraw('区域-身体')
  
  // 自定义事件
  window.svgPainter.EXP_AreaEvent('click', (event, path) => {
    console.log('我的自定义函数Click：'+path.name, event)
  })

  window.svgPainter.EXP_AreaEvent('mouseenter', (event, path) => {
    console.log('我的自定义函数Enter：'+path.name, event)
  })
  
  window.svgPainter.EXP_AreaEvent('mouseleave', (event, path) => {
    console.log('我的自定义函数Leave：'+path.name, event)
  })
})
