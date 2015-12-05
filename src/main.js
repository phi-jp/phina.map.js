
;(function() {

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

      this.width = +map._attr.width;
      this.height = +map._attr.height;
      this.tileWidth = +map._attr.tilewidth;
      this.tileHeight = +map._attr.tileheight;

      this.tilesets = map.tileset.map(function(tileset) {
        var attr = tileset._attr;
        var img = tileset.image[0];

        return {
          id: attr.firstgid,
          name: attr.name,
          tileWidth: +attr.tilewidth,
          tileHeight: +attr.tileheight,
          image: {
            source: img._attr.source,
            width: +img._attr.width,
            height: +img._attr.height,
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
  });


  phina.define('phina.tile.TiledMap', {
    superClass: 'phina.display.CanvasElement',

    init: function(mapsheet) {
      this.superInit();

      this.mapsheet = mapsheet;

      this.width = mapsheet.width*mapsheet.tileWidth;
      this.height = mapsheet.height*mapsheet.tileHeight;

      var tileset = this.mapsheet.tilesets[0];
      var xIndexMax = tileset.image.width / tileset.tileWidth;
      var image = phina.asset.AssetManager.get('image', tileset.image.source);

      this.mapsheet.layers.each(function(layer) {
        var shape = phina.display.Shape().addChildTo(this);

        shape.padding = 0;
        shape.width = mapsheet.width*mapsheet.tileWidth;
        shape.height = mapsheet.height*mapsheet.tileHeight;
        shape.backgroundColor = 'transparent';

        shape._render = function() {
          shape._renderBackground();

          layer.data.each(function(index, i) {
            if (index === -1) return ;

            // 
            var xIndex = index%xIndexMax;
            var yIndex = (index/xIndexMax)|0;
            var sx = xIndex*tileset.tileWidth;
            var sy = yIndex*tileset.tileHeight;
            // 
            var xIndex = i%mapsheet.width;
            var yIndex = (i/mapsheet.width)|0;
            var dx = xIndex*mapsheet.tileWidth;
            var dy = yIndex*mapsheet.tileHeight;

            shape.canvas.context.drawImage(image.domElement,
              sx, sy, tileset.tileWidth, tileset.tileHeight,
              dx, dy, mapsheet.tileWidth, mapsheet.tileHeight
              )
          });
        };
      }, this);
    }
  });


})();





