# Mapper.js

Mapper is a Javascript plugin for drawing a HTML `<map>` on an image. It provides hooks on initialization and several mouse events so you can trigger your own code when a certain area gets hovered or clicked.

Written by Pieter ([@pieterbeulque](http://twitter.com/pieterbeulque))
at We Work We Play
[weworkweplay.com](http://weworkweplay.com)

## Usage

```
<div class="wwwp-mapper-wrapper">
    <img src="image.jpg" usemap="#map">
    <map name="map">
        <!-- Your areas -->
    </map>
</div>
```

* Include jQuery and this plugin as close as possible to `</body>`
* Put the `<img>` and `<map>` in a container div that has the same width and height as the image and `position: relative`.
* On window load, bind Mapper.js to the image element: `$('img').mapper();`

## Demo

I provided a small demo drawing one polygon in this repository.

## Hooks

### Global

* `onInit`: triggered when Mapper gets initiated

### Area specific
The next hooks all receive the current area as a parameter.

* `onAreaInit`: triggered when one area gets initiated. Example usage is loading extra data via AJAX and then changing color according to the response.
* `onAreaMouseOver`
* `onAreaMouseOut`
* `onAreaClick`

## Browser support
Mapper.js uses `<canvas>` to draw the overlays, so it only works in modern browsers (IE9 and higher).

## Known bugs
* Mapper.js currently only supports `type="poly"` and `type="rect"`
