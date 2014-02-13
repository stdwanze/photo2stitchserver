
NodeKit = window.NodeKit || {};

var http = require("http");
var url = require("url");
(function (NodeKit) {
	"use strict";
	
	NodeKit.Router = (function (){
		
		function router ()
		{
			this.handlers = {};
			this.route = function (request,response) {
				
				var parsedUrl = url.parse(request.url);
				
				var handler = this.handlers[parsedUrl.pathname];
				
				if(handler.supports(request.method))
				{
					handler.respond(request,response);	
				}
				else
				{
					response.writeHead(404, {"Content-Type": "text/plain"});
				    response.write("No router registered");
				    response.end();
				}			
			};
			
			this.build = function ()
			{
				return this.route.bind(this);
			};
			
			
			this.registerHandler = function (callback,pathname,methods)
			{
				var handler = {
					respond : callback,
					supports : function (method)
					{
						var supports = false;
						methods.forEach(function (item){
							if(item == method)
							{
								supports = true;
							}
						});
						return supports; 
					}
				};
				this.handlers[pathname] = handler;
			};
			
		}
		
		return router;
	}());
	
	NodeKit.Server = (function ()
	{
		function server (port)
		{
			this.port = port;
			this.router = null;
			this.respond = function (req, res) {
				if(this.router !== null )
				{
					this.router(req,res) ;
				}else
				{
					response.writeHead(404, {"Content-Type": "text/plain"});
				    response.write("No router registered");
				    response.end();
				}
			};
			this.http = http.createServer(this.respond.bind(this));
 			this.run = function ()
			{
				this.http.listen(port);				
			};
			this.stop = function ()
			{
				this.http.close();
			};
			this.registerRouter = function (nodekitrouter)
			{
				this.router = nodekitrouter.build();
			};
		}
		return server;
	}());
	
	return NodeKit;
}(window.NodeKit || {}));


exports.server = NodeKit.Server;
exports.router = NodeKit.Router;

