define([
  'underscore',
  'paper',
  'backbone',
  'models/data/PaperUI',
], function(_, paper, Backbone, PaperUI) {
  
  var barHeight = 30;
  var strokeWidth = 1;
  var windowFill = '#ffffff';
  var windowStroke = '#000000';
  var winBarFill = '#cccccc';
  var winBarStroke = '#000000';

  var CurveEditor = PaperUI.extend({
    
    initialize: function(data) {
      PaperUI.prototype.initialize.apply(this, arguments);
      this.defaultWidth = this.defaultHeight = 500;
      this.width = this.get('width');
      this.height = this.get('height');
      this.corner = this.get('corner');
    },

    draw: function() {

      var win = paper.Path.Rectangle(this.corner.x, this.corner.y, this.defaultWidth, this.defaultHeight);
      win.strokeWidth = strokeWidth;
      win.strokeColor = windowStroke;
      win.fillColor = windowFill;

      var winbar = paper.Path.Rectangle(this.corner.x, this.corner.y, this.defaultWidth, barHeight);
      winbar.strokeWidth = strokeWidth;
      winbar.strokeColor = winBarStroke;
      winbar.fillColor = winBarFill;

      // get window bounds for convenient expression of locations
      var winBounds = win.bounds;

      var textX = winBounds.x;
      var textY = winBounds.y;
      var title = new paper.PointText(new paper.Point(textX, textY));
      title.justificiation = 'left';
      title.content = 'Expression Curve - ' + this.get('var_y') + ' vs ' + this.get('var_x');
      title.scale(1.2);

      var closePointTx = winbar.bounds.x + winbar.bounds.width - 25;
      var closePointTy = winbar.bounds.y + 10;
      var closeButton = new paper.Group([
        new paper.Path.Line(new paper.Point(closePointTx, closePointTy), new paper.Point(closePointTx + 10, closePointTy + 10)),
        new paper.Path.Line(new paper.Point(closePointTx + 10, closePointTy), new paper.Point(closePointTx, closePointTy + 10))
      ]);
      closeButton.strokeWidth = 1;
      closeButton.strokeColor = '#000000';

      var rangeTop = new paper.PointText(new paper.Point(winBounds.x + 30, winBounds.y + 110));
      rangeTop.justification = 'right';
      rangeTop.content = '100'; // TODO
      rangeTop.scale(1.2);

      var rangeBottom = new paper.PointText(new paper.Point(winBounds.x + 30, winBounds.y + winBounds.height - 20));
      rangeBottom.justification = 'right';
      rangeBottom.content = '0'; // TODO
      rangeBottom.scale(1.2);
      
      var domainTop = new paper.PointText(new paper.Point(winBounds.x + winBounds.width - 60, winBounds.y + 90));
      domainTop.justification = 'left';
      domainTop.content = '100'; // TODO
      domainTop.scale(1.2);

      var domainBottom = new paper.PointText(new paper.Point(winBounds.x + 40, winBounds.y + 90));
      domainBottom.justification = 'left';
      domainBottom.content = '0';
      domainBottom.scale(1.2);

      var identity = new paper.Path.Line({from: [boxTx, boxBy], to: [boxBx, boxTy]});
      identity.dashArray = [4, 4];
      identity.strokeColor = '#000000';

      var boxTx = winBounds.x + 40;
      var boxTy = winBounds.y + 100;
      var boxBx = winBounds.x + winBounds.width - 40;
      var boxBy = winBounds.y + winBounds.height - 20;
      var curveBox = new paper.Group([
        new paper.Path.Line({from: [boxTx, boxTy], to: [boxBx, boxTy], axis: 'y', valBox: rangeTop}),
        new paper.Path.Line({from: [boxTx, boxBy], to: [boxBx, boxBy], axis: 'y', valBox: rangeBottom}),
        new paper.Path.Line({from: [boxTx, boxTy], to: [boxTx, boxBy], axis: 'x', valBox: domainBottom}),
        new paper.Path.Line({from: [boxBx, boxTy], to: [boxBx, boxBy], axis: 'x', valBox: domainTop})
      ]);

      var fullgeom = new paper.Group([
        win,
        winBar,
        title,
        closeButton,
        rangeTop,
        rangeBottom,
        domainTop,
        domainBottom,
        identity,
        curveBox
      ]);
      fullgeom.scale(this.width / this.defaultWidth, this.height / this.defaultHeight, new paper.Point(winBounds.x, winBounds.y)); 
    },

    hide: function() {
      var geometry = this.get('geometry');
      geometry.visible = false;
    },

    show: function() {
      var geometry = this.get('geometry');
      if ( !geometry ) {
        this.draw();
        return;
      }
      geometry.visible = true;
    },

    redraw: function() {

    },

    addListeners: function() {

    },

    _addBoundaryListeners: function() {
      for ( var i = 0; i < this.curveBox.children.length; i++ ) {
        var frame = this;
        var line = frame.curveBox.children[i];
        line.type = 'bound-line';
        line.onMouseEnter = function( event ) {
          if (!this.active) {
            this.strokeColor = 'red';
            if ( this.axis == 'x' ) {
              paper.view.element.style.cursor = 'col-resize';
            } else {
              paper.view.element.style.cursor = 'row-resize';
            }
          }
        }
        line.onMouseLeave = function( event ) {
          if (!this.active) {
            this.strokeColor = 'black';
            paper.view.element.style.cursor = 'auto';
          }
        }
      }
    },

    onMouseDown: function( event ) {
      var hitResult = paper.project.hitTest( event.point );
      if ( hitResult && hitResult.item.type == 'bound-line' ) {
        hitResult.item.active = true;
        this.currentBound = hitResult.item;
      }
    },

    onMouseUp: function( event ) {
      clearInterval(this.interval);
      this.interval = null;
      this.time = null;
      if ( this.currentBound ) {
        this.currentBound.active = false;
        this.currentBound.onMouseLeave();
        this.currentBound = null;
      }
    },

    remove: function() {
      var geometry = this.get('geometry');
      if ( geometry ) {
        geometry.remove();
        geometry = null;
      }
    },
  });

  return CurveEditor;

});
