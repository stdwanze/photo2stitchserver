var nodekit = require("./nodekit");
var photo2stitch = require("./photo2stitch");

var server = new nodekit.server(8080);
var router = new nodekit.router();
router.registerHandler(function(req, response) {

	
	
	if (req.nodekitfiles !== undefined) {

		var form = { file : req.nodekitfiles.file, fields: req.nodekitfields };
		console.log(JSON.stringify(form));
		photo2stitch.Photo2Stitch(req.nodekitfiles,response);

	} else {
		server.serverStaticHtml("/form.htm", response);
	}

}, "/photo2stitch", ["GET", "POST"]);

server.registerRouter(router);
server.run();

console.log("server started");
