var Q = require('q');
var _db = require("./dbconnection.js");


var ScraperModel = ScraperModel || {};

(function (ScraperModel){
	
	ScraperModel.M = null;


	ScraperModel.Model = (function (){
		
		function model()
		{
			this.db = 	new _db.ScaperDB.Connection("localhost/test");
			this.Entry = null;
		}
		model.prototype = {
			
			main : function ()
			{
				var self = this;
				var deferred = Q.defer();
				this.db.connect().then(function () {
					
					try
					{
						ScraperModel.M = self.db.m;
						
						var Schema = self.db.m.Schema;
						var entrySchema = new Schema({ Minute: Number, Hour: Number, Day: Number, Month: Number, Year: Number, DateTime: Date, Value: Number, Type: String });
						entrySchema.methods.findSimilarTypes = function (cb) {
						  return this.model('Entry').find({ Type: this.Type }, cb);
						};
						self.Entry = ScraperModel.M.model('Entry', entrySchema);
						
					}
					catch(e)
					{
						console.log(e);
					}
				
					deferred.resolve();	
					
					
				}
				,function (error) { deferred.reject(error);});
				return deferred.promise;
			},
			exit : function ()
			{
				return this.db.disconnect();
			},
			
			makeEntry : function(value, type)
			{
				
				
				var deferred = Q.defer();
				
				var date = new Date();
				var entry = new this.Entry();
				
				entry.Type = "hourly";
				entry.Minute = date.getMinutes();
				entry.Hour = date.getHours();
				entry.Day = date.getDate();
				entry.Month = date.getMonth();
				entry.Year = date.getFullYear();
				entry.Value = value;
				entry.DateTime = date;
				
				
				entry.save(function (err){
					if(err) deferred.reject(err);
					else deferred.resolve(entry);
					
				});
				
				
				return deferred.promise;
				
			}
			//https://stackoverflow.com/questions/4421207/mongodb-how-to-get-the-last-n-records
		};
		
		return model;
	}());
	
	return ScraperModel;
}(ScraperModel || {}));

exports.Model = ScraperModel.Model;
