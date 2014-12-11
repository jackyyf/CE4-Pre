(function($) {
	document.addEventListener("impress:init", function( e ) {
		var ev = window.event || e;
		var api = ev.detail.api;
		var currentElement = null;

		var animation_reverse = {
			'fadeIn'	: 'fadeOut',
			'fadeOut'	: 'fadeIn',
			'show'		: 'hide',
			'hide'		: 'show',
		};
		var animate_queue = {};
		var animate_cursor = {};
		var default_length = 500;

		$('.step').each(function() {
			var $id = $(this).attr( 'id' );
			animate_queue[$id] = [];
			animate_cursor[$id] = 0;
			var maxCursor = 0;
			$(this).children().each(function() {
				var dataset = $(this).data();
				if (typeof dataset.animation != 'undefined') {
					var cursor = dataset.cursor !== undefined ? dataset.cursor : maxCursor + 1;
					maxCursor = Math.max(maxCursor, cursor);
					if(typeof animate_queue[$id][cursor] == 'undefined') {
						animate_queue[$id][cursor] = [];
					}
					animate_queue[$id][cursor].push({
						'animation'	: dataset.animation,
						'target'	: $(this),
						'length'	: dataset.length !== undefined ? dataset.length : default_length
					});
				}
			});
		});

		document.addEventListener("impress:stepenter", function( e ) {
			var ev = window.event || e;
			currentElement = $(ev.target);
		}, false);

		document.addEventListener("impress:stepleave", function( e ) {
			var ev = window.event || e;
			currentElement = null;
		}, false);

		var nextAnimation = function () {
			if (currentElement === null)
				return;
			var $id = currentElement.attr( 'id' );
			var $cursor = animate_cursor[$id];
			for(; $cursor < 256; ++ $cursor) {
				if(typeof animate_queue[$id][$cursor] != 'undefined') {
					animate_queue[$id][$cursor].forEach(function(now) {
						now.target[now.animation] && now.target[now.animation](now.length);
					})
					break;
				}
			}
			if ($cursor > 255) {
				api.next();
			}
			animate_cursor[$id] = $cursor + 1;
		};

		var lastAnimation = function () {
			if (currentElement === null)
				return;
			var $id = currentElement.attr( 'id' );
			var $cursor = animate_cursor[$id];
			for(-- $cursor; $cursor >= 0; -- $cursor) {
				if(typeof animate_queue[$id][$cursor] != 'undefined') {
					animate_queue[$id][$cursor].forEach(function(now) {
						now.target[animation_reverse[now.animation]] && now.target[animation_reverse[now.animation]](now.length);
					})
					break;
				}
			}
			if ($cursor < 0) {
				api.prev();
			}
			animate_cursor[$id] = $cursor;
		};

		var MouseWheelHandler = (function() {
			var lastFired = (new Date()).valueOf();
			return function( e ) {
				var ev = window.event || e;
				ev.preventDefault();
				var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
				var now = (new Date()).valueOf();
				if (now - 500 < lastFired) // 500 ms
					return;
				lastFired = now;
				if (delta < 0) {
					// Scroll down.
					nextAnimation();
				} else {
					lastAnimation();
				}
			}
		})();

		document.addEventListener("mousewheel", MouseWheelHandler, false);
		document.addEventListener("DOMMouseScroll", MouseWheelHandler, false);

		document.addEventListener("keydown", function( e ) {
			var ev  = window.event || e;
			switch( ev.keyCode ) {
				case 37: // leftarrow
				case 38: // uparrow
					lastAnimation();
					ev.preventDefault();
					break;
				case 32: // space
				case 39: // rightarrow
				case 40: // downarrow
					nextAnimation();
					ev.preventDefault();

			}
		});
	}, false);
}) (jQuery);
