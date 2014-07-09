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
						sold : 0
					},
					
					keyf: function(doc) {
						
               			return{ _date: doc.Day+"_"+doc.Month+"_"+doc.Year } ;
           			
           			},
					reduce : function(curr, result) {
						result.max = curr.Value > result.max ? curr.Value : result.max;
						result.min = curr.Value < result.min ? curr.Value : result.min;
					},
					finalize : function(result) {
						result.sold = result.max - result.min;
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
