

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
	else
	{
		response.write("<!DOCTYPE HTML>"+
"<html>"+
"	<head>"+
"		"+
"	</head>"+
"	<body>"+
"		<form action='http://nodeone.cloudapp.net/photo2stitch'  method='post'  enctype='multipart/form-data'>"+
"				<input id='photopath' type='file' size='50' maxlength='1000000' name='file' /><div>"+
"				<input type='submit' value='Submit'>"+
"		</form>"+
"	</body>"+
"</html>");
	}
	
    response.end();
	
	
},"/photo2stitch",["GET", "POST"]);

server.registerRouter(router);
server.run();

console.log("server started");
