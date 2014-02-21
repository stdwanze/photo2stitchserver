

var nodekit = require("./nodekit");
var fs = require("fs");
var Canvas = require("canvas");
var P = require("./pixastic");

var server = new nodekit.server(8080);
var router = new nodekit.router();
router.registerHandler(function (req,response){
	
	
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

	function scaleDown(canvas,ctxt,image)
	{
		var dimensions = getScaleDimesions(canvas,image);
		ctxt.drawImage(image, 0, 0, dimensions.width , dimensions.height );
		canvas.width = dimensions.width;
		canvas.heigth = dimensions.heigth;
		
	}
	
	function deliverImageHTML(response,base64buffer)
	{
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<!DOCTYPE HTML><html><head></head><body><img src='data:image/gif;base64,"+base64buffer+"'></body>");
		response.end();
	}
    
	if(req.nodekitfiles !== undefined)
	{
		
		console.log(req.nodekitfiles.length);
		var resultJSON = {};
		fs.readFile(req.nodekitfiles.file.path, function(err, original_data){
			
			
			var canvas = new Canvas(1024,1024);
			var ctxt = canvas.getContext("2d");
			var image = new Canvas.Image;
			
			P = new P._Pixastic(ctxt);
			
			
			image.src = original_data;
			scaleDown(canvas, ctxt,image);
			image.src = original_data = canvas.toBuffer();
			P["desaturate"]().done(function (){
				original_data = canvas.toBuffer();
				var base64String = original_data.toString("base64");
				resultJSON.nkFiles = req.nodekitfiles;
				resultJSON.bufferSize = base64String.length;
				
				fs.unlink(req.nodekitfiles.file.path, function (){ console.log("file detached!"+req.nodekitfiles.file.path);});
				deliverImageHTML(response,base64String);
			});
			/*
			 * 	Pixastic.process(ret,"crop",this.cropDimensionsTo(dimensions,this.blockSize())).done(function (ret){
						Pixastic.process(ret, "desaturate", {average : false}).done( function (ret)	{
						Pixastic.process(ret, "mosaic", {blockSize: this.blockSize()}).done(function (ret){
						Pixastic.process(ret, "posterize", {levels : this.posterizeLevel()+1}).done( function (ret){
			 * 
			 */
			
				
		});
		
		
	}
	else
	{
		server.serverStaticHtml("/form.htm",response);
	}
	
   
	
	
},"/photo2stitch",["GET", "POST"]);

server.registerRouter(router);
server.run();

console.log("server started");
