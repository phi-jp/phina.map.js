
var toArray = function(arr) {  
  return Array.prototype.slice.call(arr);
};

phina.define('phina.tile.MapSheet', {
  superClass: 'phina.asset.Asset',

  init: function() {
    this.superInit();
  },

  _load: function(resolve) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.src);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if ([200, 201, 0].indexOf(xhr.status) !== -1) {
          var text = xhr.responseText;
          var parser = new DOMParser();
          var xml = parser.parseFromString(text, 'text/xml');
          var json = self._xmlToJSON(xml);
          self._loadFromTiledMap(json);

          resolve(self);
        }
      }
    };

    xhr.send(null);
  },

  _loadFromTiledMap: function(json) {
    var map = json.map[0];

    this.width = map._attr.width;
    this.height = map._attr.height;
    this.tileWidth = map._attr.tilewidth;
    this.tileHeight = map._attr.tileheight;

    this.tilesets = map.tileset.map(function(tileset) {
      var attr = tileset._attr;
      var img = tileset.image[0];
      return {
        id: attr.firstgid,
        name: attr.name,
        tileWidth: attr.tilewidth,
        tileHeight: attr.tileheight,
        image: {
          source: img._attr.source,
          width: img._attr.width,
          height: img._attr.height,
        }
      };
    });

    this.layers = map.layer.map(function(layer) {
      var attr = layer._attr;
      var data = layer.data[0];
      var d = null;

      if (data._attr.encoding === 'csv') {
        d = data._text.split(',').map(function(n) {
          return parseInt(n) -1;
        });
      }
      else if (data._attr.encoding === 'base64') {
        var d = window.atob(data._text);
        // TODO: なぜか上手くいかない...
      }
      return {
        name: attr.name,
        width: attr.width,
        height: attr.height,
        data: d,
      };
    });
  },

  _xmlToJSON: function(xml) {
    var _parse = function(xml, json) {

      // attributes
      var attributes = xml.attributes;
      if (xml.attributes && xml.attributes.length > 0) {
        json._attr = {};
        toArray(xml.attributes).forEach(function(attr) {
          var key = attr.name;
          var value = attr.value;
          json._attr[key] = value;
        });
      }

      // children
      if (xml.childNodes.length > 0) {
        toArray(xml.childNodes).forEach(function(node) {
          if (node.nodeType === 1) {
            var child = {};
            _parse(node, child);

            if (!json[node.tagName]) {
              json[node.tagName] = [];
            }
            json[node.tagName].push(child);
          }
          else if (node.nodeType === 3) {
            json._text = node.textContent.trim();
          }
        });
      }

      return json;
    };

    return _parse(xml, {});
  },
})

phina.define('phina.tile.TileShape', {
  superClass: 'phina.display.Shape',

  init: function(options) {
    this.superInit();

    this.tile = options.tile;
    this.map = options.map;

    this.map.cols = this.map.data.length/this.map.rows;

    this.image = phina.asset.AssetManager.get('image', this.tile.image);

    this.backgroundColor = 'transparent';

    this.padding = 0;
    this.width = options.map.width*this.map.rows;
    this.height = options.map.height*this.map.cols;
  },

  _render: function() {
    this._renderBackground();
    var canvas = this.canvas;

    this.map.data.each(function(index, i) {
      if (index === -1) return ;
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


phina.define('phina.tile.TiledMap', {
  superClass: 'phina.display.CanvasElement',

  init: function() {
    this.superInit();
  }
});





