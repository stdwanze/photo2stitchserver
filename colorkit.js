var colorkit = {
	rGBtoHSV : function RGBtoHSV(r, g, b) {
		var min, max, delta;
		var hsv = {
			v : 0,
			s : 0,
			v : 0
		};
		min = Math.min(r, Math.min(g, b));
		max = Math.max(r, Math.min(g, b));
		hsv.v = max;
		// v
		delta = max - min;
		if (max != 0)
			hsv.s = delta / max;
		// s
		else {
			// r = g = b = 0		// s = 0, v is undefined
			hsv.s = 0;
			hsv.h = 0;
			return hsv;
		}
		if (r == max)
			hsv.h = (g - b ) / delta;
		// between yellow & magenta
		else if (g == max)
			hsv.h = 2 + (b - r ) / delta;
		// between cyan & yellow
		else
			hsv.h = 4 + (r - g ) / delta;
		// between magenta & cyan
		hsv.h *= 60;
		// degrees
		if (hsv.h < 0)
			hsv.h += 360;

		return hsv;
	}
};

exports.ColorKit = colorkit; 