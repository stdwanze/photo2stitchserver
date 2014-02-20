

var nodekit = require("./nodekit");
var fs = require("fs");

var server = new nodekit.server(8080);
var router = new nodekit.router();

router.registerHandler(function (req,response){
	
	
	
    
	if(req.nodekitfiles !== undefined)
	{
		response.writeHead(200, {"Content-Type": "application/json"});
    
		console.log(req.nodekitfiles.length);
		var resultJSON = {};
		fs.readFile(req.nodefiles.file.path, function(err, original_data){
			var base64String = original_data.toString("base64");
			
			resultJSON.nkFiles = req.nodekitfiles;
			resultJSON.bufferSize = base64String.length;
			response.write(JSON.stringify(resultJSON));
			
			fs.unlink(req.nodefiles.file.path, function (){});
		});
		
		
	}
	else
	{
			response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<!DOCTYPE HTML>"+
"<html>"+
"	<head>"+
"		"+
"	</head>"+
"	<body>"+
"		<form action='http://nodetwo.cloudapp.net/photo2stitch'  method='post'  enctype='multipart/form-data'>"+
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
