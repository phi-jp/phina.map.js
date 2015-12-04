

phina.define('phina.tile.SimpleTile', {
  superClass: 'phina.display.Shape',

  init: function(options) {
    this.superInit();

    this.tile = options.tile;
    this.maps = options.maps;

    this.tileWidth = 64;
    this.tileHeight = 64;

    this.xmax = this.maps.reduce(function(prev, d) {
      var l = d.length;
      return l > prev ? l : prev;
    }, 0);
    this.ymax = this.maps.length;

    this.padding = 0;
    this.image = phina.asset.AssetManager.get('image', this.tile.image);

    this.width = options.chipWidth*this.xmax;
    this.height = options.chipHeight*this.ymax;
  },

  _render: function() {
    this._renderBackground();
    var canvas = this.canvas;

    this.maps.each(function(d, y) {
      d.each(function(index, x) {
        var dx = x*this.tileWidth;
        var dy = y*this.tileHeight;
        canvas.context.drawImage(this.image.domElement,
          0, 0, 32, 32,
          dx, dy, this.tileWidth, this.tileHeight
          )
      }, this);
    }, this);
  },
});

