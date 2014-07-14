var MongoClient = require('mongodb').MongoClient, format = require('util').format;

var factorioDataService = factorioDataService || {}; ( function(factorioDataService) {

		factorioDataService.GetDayly = function(callback) {

			MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
				if (err)
					throw err;

				var group = {
					ns : 'entries',
					initial : {
						max : 0,
						min : 999999999,
						sold : 0,
						date: 0,
						avg : 0,
						hourlymax : 0,
						hourlymin : 999999999,
						all : []
					},
					
					keyf: function(doc) {
						
               			return{ _date: doc.Day+"_"+doc.Month+"_"+doc.Year } ;
           			
           			},
					reduce : function(curr, result) {
						result.max = curr.Value > result.max ? curr.Value : result.max;
						result.min = curr.Value < result.min ? curr.Value : result.min;
						result.date = curr.DateTime;
						result.all.push(curr.Value);
					},
					finalize : function(result) {
						result.sold = result.max - result.min;
						result.avg = result.sold / result.all.length;
						result.all.sort();
						var last = result.all[0];
						
						for(var i = 0; i < result.all.length; i++)
						{
							var curr = result.all[i] - last;
							result.hourlymax = curr > result.hourlymax ? curr : result.hourlymax;
							result.hourlymin = curr < result.hourlymin && curr != 0 ? curr : result.hourlymin;
							last = result.all[i];
						}
						delete result.all ;
					}
				};

				var collection = db.collection('entries');

				collection.group(group.keyf, group.cond, group.initial, group.reduce, group.finalize, true, function(err, results) {
					console.log('group results %j', results);
					db.close();
					callback(results);
					
				});

			});
		};

		return factorioDataService;
	}(factorioDataService || {}));

exports.service = factorioDataService;
