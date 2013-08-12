/*
 _    _        _    _            _      _    _       ______ _
| |  | |      | |  | |          | |    | |  | |      | ___ \ |
| |  | | ___  | |  | | ___  _ __| | __ | |  | | ___  | |_/ / | __ _ _   _
| |/\| |/ _ \ | |/\| |/ _ \| '__| |/ / | |/\| |/ _ \ |  __/| |/ _` | | | |
\  /\  /  __/ \  /\  / (_) | |  |   <  \  /\  /  __/ | |   | | (_| | |_| |
 \/  \/ \___|  \/  \/ \___/|_|  |_|\_\  \/  \/ \___| \_|   |_|\__,_|\__, |
                                                                     __/ |
                                                                    |___/
*/

;(function ($, window, document, undefined) {
    "use strict";

    var Area = (function () {

        function Area(el) {
            this.id = null;
            this.$el = el;
            this.$overlay = null;
            this.$hoverlay = null;
            this.coords = [];

            this.options = {
                normal: {
                    color: 'rgba(255, 0, 0, .2)',
                    strokeColor: 'rgba(148, 0, 0, .3)'
                },
                mouseover: {
                    color: 'rgba(255, 0, 0, 0.5)',
                    strokeColor: 'rgba(148, 0, 0, 0)'
                },
                click: {}
            };

            this.type = this.$el.attr('shape');

            this.dissectCoords();

            this.bind();
        }

        Area.prototype.bind = function () {
            var that = this;

            this.$el.on('mouseover', function () {
                $(that).trigger('mouseover');
                that.showOverlay();
            });

            this.$el.on('mouseout', function () {
                $(that).trigger('mouseout');
                that.clearOverlay();
            });

            this.$el.on('click', function () {
                $(that).trigger('click');
            });
        };

        Area.prototype.dissectCoords = function () {
            var raw = this.$el.attr('coords').replace(' ', '').split(','),
                i;

            for (i = 0; i < raw.length; i += 2) {
                this.coords.push({x: parseInt(raw[i], 10), y: parseInt(raw[i + 1], 10)});
            }

        };

        Area.prototype.addToOverlay = function (overlay, hoverlay, draw) {
            this.$overlay = overlay;
            this.$hoverlay = hoverlay;

            this.$hoverlay.hide();

            if (draw === undefined) {
                draw = true;
            }

            if (draw) {
                this.draw();
            }
        };

        Area.prototype.showOverlay = function () {
            var context = this.$hoverlay.get(0).getContext('2d'),
                color = this.options.mouseover.color;

            context.fillStyle = color;
            this.drawToContext(context);

            this.$hoverlay.show();
        };

        Area.prototype.clearOverlay = function () {
            var context = this.$hoverlay.get(0).getContext('2d');
            context.clearRect(0, 0, this.$hoverlay.width(), this.$hoverlay.height());
        };

        Area.prototype.draw = function (color) {
            var context = this.$overlay.get(0).getContext('2d');

            if (!color) {
                color = this.options.normal.color;
            }

            context.fillStyle = color;
            context.strokeStyle = this.options.normal.strokeColor;
            context.lineWidth = 1;

            this.drawToContext(context);
        };

        Area.prototype.drawToContext = function (context) {
            context.beginPath();

            switch (this.type) {
            case 'poly':
                var i = 1,
                    coord;
                context.moveTo(this.coords[0].x, this.coords[0].y);

                for (i; i < this.coords.length; i += 1) {
                    coord = this.coords[i];
                    context.lineTo(coord.x, coord.y);
                }
                break;

            case 'rect':
                // coords[1] is actually width and height
                context.rect(this.coords[0].x, this.coords[0].y, this.coords[1].x, this.coords[1].y);
                break;
            }

            context.closePath();
            context.fill();
            context.stroke();
        };

        return Area;

    }());

    var pluginName = "mapper",
        defaults = {
            map: null,
            height: 0,
            width: 0,
            autoDraw: true,
            onInit: function () {},
            onAreaInit: function () {},
            onAreaMouseOver: function (area) {},
            onAreaMouseOut: function (area) {},
            onAreaClick: function (area) {}
        };

    function Mapper(element, options) {
        this.element = element;
        this.$el = $(this.element);
        this.$map = null;
        this.areas = [];
        this.$overlay = $('<canvas class="wwwp-mapper" style="position: absolute; z-index: 1; max-width: 100%; width: 100%;" />');
        this.$hoverlay = $('<canvas class="wwwp-mapper wwwp-mapper-highlight" style="position: absolute; z-index: 1; max-width: 100%; width: 100%;" />');
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Mapper.prototype = {
        init: function () {
            if (!this.settings.map) {
                this.settings.map = 'map[name="' + $(this.element).attr('usemap').substr(1) + '"]';
            }

            if (this.settings.height === 0) {
                this.settings.height = this.$el.height();
            }

            if (this.settings.width === 0) {
                this.settings.width = this.$el.width();
            }

            this.$el.css('position', 'absolute');

            this.$map = $(this.settings.map);

            this.$overlay.attr('width', this.settings.width);
            this.$overlay.attr('height', this.settings.height);

            this.$hoverlay.attr('width', this.settings.width);
            this.$hoverlay.attr('height', this.settings.height);

            this.$el.before(this.$overlay);
            this.$overlay.before(this.$hoverlay);

            // Create a duplicate image with hidden visibility for area hovers
            this.$el.after(this.$el.clone().removeAttr('id').addClass('wwwp-hover-image')).css('opacity', 0).css('z-index', 99).css('position', 'absolute');

            this.loadAreas();

            this.settings.onInit();
        },

        loadAreas: function () {
            var that = this;

            this.$map.find('area').each(function () {
                var area = new Area($(this));
                area.id = that.areas.length + 1;
                area.addToOverlay(that.$overlay, that.$hoverlay, that.settings.autoDraw);

                $(area).on('mouseover', function () {
                    that.settings.onAreaMouseOver(this);
                });

                $(area).on('mouseout', function () {
                    that.settings.onAreaMouseOut(this);
                });

                $(area).on('click', function (e) {
                    e.preventDefault();
                    that.settings.onAreaClick(this);
                });

                that.settings.onAreaInit(area);

                that.areas.push(area);
            });
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "wwwp-" + pluginName)) {
                $.data(this, "wwwp-" + pluginName, new Mapper(this, options));
            }
        });
    };

})(jQuery, window, document);