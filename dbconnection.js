var Q = require('q');

var mongoose = require('mongoose');

var ScraperDB = ScraperDB || {};

(function(ScraperDB){
	
	ScraperDB.Connection = (function() {
		
		function connection (url)
		{
			this.url = "mongodb://"+url;
			console.log(this.url);
			this.db = null;
			this.m = mongoose;
		}
		connection.prototype = {
			
			connect : function ()
			{
				var deferred = Q.defer();	
			
				this.m.connect(this.url); //'mongodb://localhost/test'
				this.db = mongoose.connection;
				this.db.on('error', function () { deferred.reject(new Error("connection error")); });
				this.db.once('open', function callback () {
				  deferred.resolve();
				});
			
				return deferred.promise;
			},
			disconnect : function () {
				var deferred = Q.defer();	
				
				this.db.close(function () {
				 	
				  	deferred.resolve();
				  });
				return deferred.promise;
			}
		};
		
		return connection;
	}());
	
	return ScraperDB;
}(ScraperDB || {}));

exports.ScaperDB = ScraperDB;

