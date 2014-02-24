var nodekit = require("./nodekit");
var fs = require("fs");
var Canvas = require("canvas");
var P = require("./pixastic");

var server = new nodekit.server(8080);
var router = new nodekit.router();
router.registerHandler(function(req, response) {

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
		var numberSign =["I","II","IV","V","VI","IX","X","XI"];
		
		for(var i = 0; i < blocks.length; i++)
		{
			var binarydata = ctxt.getImageData(blocks[i].PosX,blocks[i].PosY,1,1);
			var color = "rgb("+binarydata[0]+","+binarydata[1]+","+binarydata[3]+")";
			var letter = numberSign[getNumberForColor(color)];
			ctx.save();
			ctx.fillStyle = "#FFFFFF";
			ctx.font = (blockSize-2)+"px curier new";
			ctx.fillText(letter,blocks[i].PosX +(3-letter.length),blocks[i].PosY +(blockSize-1));
			ctx.restore();
		}
	}
	
	
	
	
	if (req.nodekitfiles !== undefined) {

		console.log("request for file "+req.nodekitfiles.file.path+" recieved");
		console.log(req.nodekitfiles.length);
		var resultJSON = {};
		fs.readFile(req.nodekitfiles.file.path, function(err, original_data) {

			var canvas = new Canvas(1020, 1020);
			var ctxt = canvas.getContext("2d");
			var image = new Canvas.Image;

			var pixastic = new P._Pixastic(ctxt);

			image.src = original_data;
			scaleDown(canvas, ctxt, image);
			var options = { blockSize : 10};
			//image.src = original_data = canvas.toBuffer();
			pixastic["desaturate"]().done(function() {
			pixastic["mosaic"](options).done(function() {
			pixastic["posterize"]({	levels : 5 }).done(function() {

						applyLines(canvas,ctxt,10);
						applyColorSign(ctxt,11,options.blocks);
						console.log("computation done, encode and send back");
					//	console.log(JSON.stringify(options.blocks));
						original_data = canvas.toBuffer();
						var base64String = original_data.toString("base64");
						resultJSON.nkFiles = req.nodekitfiles;
						resultJSON.bufferSize = base64String.length;

						fs.unlink(req.nodekitfiles.file.path, function() {
							console.log("file detached!" + req.nodekitfiles.file.path);
						});
						deliverImageHTML(response, base64String);
			});
			});
			});
			/*
			 * 	Pixastic.process(ret,"crop",this.cropDimensionsTo(dimensions,this.blockSize())).done(function (ret){
			 Pixastic.process(ret, "desaturate", {average : false}).done( function (ret)	{
			 Pixastic.process(ret, "mosaic", {blockSize: this.blockSize()}).done(function (ret){
			 Pixastic.process(ret, "posterize", {levels : this.posterizeLevel()+1}).done( function (ret){
			 *
			 */

		});

	} else {
		server.serverStaticHtml("/form.htm", response);
	}

}, "/photo2stitch", ["GET", "POST"]);

server.registerRouter(router);
server.run();

console.log("server started");
