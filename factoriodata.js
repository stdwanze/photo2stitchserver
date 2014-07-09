var MongoClient = require('mongodb').MongoClient, format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
	if (err)
		throw err;

	var group = {
		ns : 'entries',
		initial : {
			max : 0,
			min : 0,
			sold : 0
		},
		key : {
			Day : 1
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

	collection.group(group.key, group.cond, group.initial, group.reduce, group.finalize, true, function(err, results) {
		console.log('group results %j', results);
	});
	db.close();
}); 