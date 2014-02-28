var fs = require("fs");
var Canvas = require("canvas");
var P = require("./pixastic");
var colorKit = require("./colorkit");

var photo2Stitch = (function (){
	
	function getScaleDimesions(canvas, image) {
		var newDimensions = {
			width : 1,
			height : 1
		};

		var xScale = image.width / (canvas.width );
		var yScale = image.height / (canvas.height);
		var scale = xScale > yScale ? xScale : yScale;

		newDimensions.width = Math.floor(image.width / scale);
		newDimensions.height = Math.floor(image.height / scale);

		return newDimensions;
	};

	function scaleDown(canvas, ctxt, image) {
		var dimensions = getScaleDimesions(canvas, image);
		ctxt.drawImage(image, 0, 0, dimensions.width, dimensions.height);
		return scaledDimensions;
	}

	function deliverImageHTML(response, base64buffer) {
		response.writeHead(200, {
			"Content-Type" : "text/html"
		});
		response.write("<!DOCTYPE HTML><html><head></head><body><img src='data:image/gif;base64," + base64buffer + "'></body>");
		response.end();
	}

	function applyLines(canvas,ctxt,blockSize) {

		var row = 0, column = 0;

		while (row < canvas.height ) {
			ctxt.strokeStyle = '#848484';
			ctxt.lineWidth = 1;
			ctxt.beginPath();
			ctxt.moveTo(0, row);
			ctxt.lineTo(canvas.width + 4 * blockSize, row);

			ctxt.closePath();
			ctxt.stroke();

			row += blockSize+1;
		}

		while (column < canvas.width ) {
			ctxt.strokeStyle = '#848484';
			ctxt.lineWidth = 1;
			ctxt.beginPath();
			ctxt.moveTo(column, 0);
			ctxt.lineTo(column, canvas.height);
			
			ctxt.closePath();
			ctxt.stroke();

			column += blockSize;
		}

	};
	function getNumberForColorController()
	{
		
		var map = {};
		var current = 0;
		
		return function (colorString){
			
			if(colorString in map)
			{
				
				return map[colorString];
			}
			else{
				console.log("add "+colorString+" to color map");
				map[colorString] = current++;
				return map[colorString];
			}
		};
	};
	function applyColorSign(ctx,blockSize,blocks)
	{
		var getNumberForColor = getNumberForColorController();
		var numberSign =["I","II","IV","V","VI","IX","X","XI","L","M","A","B","C","D","E"];
		
		for(var i = 0; i < blocks.length; i++)
		{
			var binarydata = ctx.getImageData(blocks[i].PosX,blocks[i].PosY,1,1);
			var color = "rgb("+binarydata.data[0]+","+binarydata.data[1]+","+binarydata.data[2]+")";
			
			var numberIndex = getNumberForColor(color);
			numberIndex = numberIndex < numberSign.length ? numberIndex: 0;
			var letter = numberSign[ numberIndex ] ;
			ctx.save();
			ctx.fillStyle = "#FFFFFF";
			ctx.font = (blockSize-2)+"px curier new";
			ctx.fillText(letter,blocks[i].PosX +(3-letter.length),blocks[i].PosY +(blockSize-1));
			ctx.restore();
		}
	}
	function getDominantColor(ctxt,width,heigth){
		
		var binarydata = ctx.getImageData(0,0,width,height);
		var hues = [];
		var saturations = [];
		var brightness = [];
		for(var i = 0; i < binarydata.length; i+=4)
		{
			var hsv = colorKit.ColorKit.rGBtoHSV(binarydata.data[i],binarydata.data[i+1],binarydata.data[i+2]);
			var hue = Math.round(hsv.h);
			hues[hue] += 1;
			saturations[hue] += hsv.s;
			brightness[hue] += hsv.v;
		}
		
		var hueCount = hues[0];
		var hue = 0, sat = 0, vel = 0;
		for(var i = 1; i < hues.length; i++)
		{
			if(hues[i] > hueCount)
			{
				hueCount = hue[i];
				hue = i;
				sat = saturations[i];
				vel = brightness[i];
			}
		}
		
		return  { h : hue , s: sat, v : vel};
		
	}
	
	
	return function(form,response)
	{
		console.log("request for file "+form.file.path+" recieved");
		var resultJSON = {};
		
//		{"blocksize":"10","levels":"5","withsigns":"on"}
		var blockSize = parseInt(form.fields.blocksize);
		var levels = parseInt(form.fields.levels);
		var signs = form.fields.withsigns !== undefined ? true: false;
		
		var canvasSize = (1020 % blockSize)+1020;
		
				
		fs.readFile(form.file.path, function(err, original_data) {

			var canvas = new Canvas(canvasSize, canvasSize);
			var ctxt = canvas.getContext("2d");
			var image = new Canvas.Image;

			var pixastic = new P._Pixastic(ctxt);

			image.src = original_data;
			scaleDown(canvas, ctxt, image);
			var options = { blockSize : blockSize};
			//image.src = original_data = canvas.toBuffer();
			pixastic["desaturate"]({ bypass : false }).done(function() {
			pixastic["mosaic"](options).done(function() {
			pixastic["posterize"]({	levels : levels-1 }).done(function() {

						if(signs) applyColorSign(ctxt,blockSize+1,options.blocks);
						applyLines(canvas,ctxt,blockSize);
						console.log("computation done, encode and send back");
					//	console.log(JSON.stringify(options.blocks));
						original_data = canvas.toBuffer();
						var base64String = original_data.toString("base64");
						resultJSON.nkFiles = form;
						resultJSON.bufferSize = base64String.length;

						fs.unlink(form.file.path, function() {
							console.log("file detached!" + form.file.path);
						});
						deliverImageHTML(response, base64String);
			});
			});
			});
			

		});

	};
	
}());

exports.Photo2Stitch = photo2Stitch;
