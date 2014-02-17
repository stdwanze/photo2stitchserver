

var nodekit = require("./nodekit");


var server = new nodekit.server(8080);
var router = new nodekit.router();

router.registerHandler(function (req,response){
	
	
	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    
	if(req.nodekitfiles !== undefined)
	{
		console.log(req.nodekitfiles.length);
		response.write(JSON.stringify(req.nodekitfiles));
	//	response.write(req.nodekitfiles.length +" -> " +req.nodekitfiles[0].size + " name: "+req.nodekitfiles[0].name);
	}
	
    response.end();
	
	
},"/photo2stitch",["GET", "POST"]);

server.registerRouter(router);
server.run();

console.log("server started");
