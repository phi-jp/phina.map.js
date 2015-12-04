

phina.define('phina.tile.SimpleTile', {
  superClass: 'phina.display.Shape',

  init: function(options) {
    this.superInit();

    this.tile = options.tile;
    this.map = options.map;

    this.map.cols = this.map.data.length/this.map.rows;

    this.image = phina.asset.AssetManager.get('image', this.tile.image);

    this.padding = 0;
    this.width = options.map.width*this.map.rows;
    this.height = options.map.height*this.map.cols;
  },

  _render: function() {
    this._renderBackground();
    var canvas = this.canvas;

    this.map.data.each(function(index, i) {
      // 
      var xIndex = index%this.tile.rows;
      var yIndex = (index/this.tile.rows)|0;
      var sx = xIndex*this.tile.width;
      var sy = yIndex*this.tile.height;

      // 
      var xIndex = i%this.map.rows;
      var yIndex = (i/this.map.rows)|0;
      var dx = xIndex*this.map.width;
      var dy = yIndex*this.map.height;

      canvas.context.drawImage(this.image.domElement,
        sx, sy, this.tile.width, this.tile.height,
        dx, dy, this.map.width, this.map.height
        )
    }, this);
  },
});

