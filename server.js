

var nodekit = require("./nodekit");


var server = new nodekit.server(8080);
var router = new nodekit.router();

router.registerHandler(function (req,response){
	
	
	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    
	if(req.nodekitbody !== undefined)
	{
		response.write(req.nodekitbody);
	}
	
    response.end();
	
	
},"/photo2stitch",["GET"]);

server.registerRouter(router);
server.run();

console.log("server started");
