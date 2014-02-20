var NodeKit = NodeKit || {};

var http = require("http");
var url = require("url");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs"); ( function(NodeKit) {"use strict";

		NodeKit.Router = ( function() {

				function router() {
					this.handlers = {};
					this.route = function(request, response) {

						console.log("route");

						var parsedUrl = url.parse(request.url);
						console.log("parsedUrl.pathname: " + parsedUrl.pathname);

						var handler = this.handlers[parsedUrl.pathname];
						if (handler !== undefined && handler !== null)
							console.log("handler found");
						else
							console.log("no handler found");
						if (handler !== undefined && handler !== null && handler.supports(request.method)) {
							console.log("reponds with handler");

							if (request.method == "POST") {

								var form = new formidable.IncomingForm();
								form.parse(request, function(err, fields, files) {
									request.nodekitfields = fields;
									request.nodekitfiles = files;
									handler.respond(request, response);
								});

							} else {
								handler.respond(request, response);
							}
						} else {
							console.log("reponds without handler");
							response.writeHead(200, {
								"Content-Type" : "text/plain"
							});
							response.write("No handler registered");
							response.end();
						}
						console.log("route end");
					};

					this.build = function() {
						for (var key in this.handlers) {
							console.log("handler: " + key);
						}

						return this.route.bind(this);
					};

					this.registerHandler = function(callback, pathname, methods) {
						var handler = {
							respond : callback,
							supports : function(method) {
								var supports = false;
								methods.forEach(function(item) {
									if (item == method) {
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

		NodeKit.Server = ( function() {
				function server(port) {
					this.port = port;
					this.router = null;
					this.respond = function(req, res) {

						console.log("request recieved");

						if (this.router !== null) {
							console.log("router registered");
							this.router(req, res);
						} else {
							this.serve404(res);
							/*response.writeHead(200, {
								"Content-Type" : "text/plain"
							});
							response.write("No router registered");
							response.end();*/
						}
					};
					this.http = http.createServer(this.respond.bind(this));
					this.run = function() {
						this.http.listen(port);
					};
					this.stop = function() {
						this.http.close();
					};
					this.registerRouter = function(nodekitrouter) {
						this.router = nodekitrouter.build();
					};
					this.serverStaticHtml = function(relpathFile, res) {
						console.log("serve: "+relpathFile);
						var filename = path.join(process.cwd(), relpathFile);
						fs.exists(filename, function(exists) {
							if (!exists) {
								filename = path.join(process.cwd(),"/goaway.htm");
							}

							res.writeHead(200, {
								'Content-Type' : "text/html"
							});

							var fileStream = fs.createReadStream(filename);
							fileStream.pipe(res);
						});
					};
					this.serve404 = function (res) {
						this.serverStaticHtml("/goaway.htm",res);
					};
				}

				return server;
			}());

		return NodeKit;
	}(NodeKit || {}));

exports.server = NodeKit.Server;
exports.router = NodeKit.Router;

