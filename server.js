var nodekit = require("./nodekit");
var photo2stitch = require("./photo2stitch");
var facservice = require("./factoriodata.js").service;

var server = new nodekit.server(8080);
var router = new nodekit.router();
router.registerHandler(function(req, response) {

	
	
	if (req.nodekitfiles !== undefined) {

		var form = { file : req.nodekitfiles.file, fields: req.nodekitfields };
		console.log(JSON.stringify(form));
		photo2stitch.Photo2Stitch(form,response);

	} else {
		server.serverStaticHtml("/form.htm", response);
	}

}, "/photo2stitch", ["GET", "POST"]);

router.registerHandler(function(req, response) {

	
	server.serverStaticHtml("/showFactorioSalesData.htm", response);
	

}, "/showFactorioSalesData.htm", ["GET"]);

router.registerHandler(function(req, response) {

	facservice.GetDayly(function (result){
		response.writeHead(200, {
			"Content-Type" : "application/json"
		});
		response.write(JSON.stringify(result));
		response.end();
	});

}, "/getFactorioSalesData", ["GET"]);


server.registerRouter(router);
server.run();

console.log("server started");
