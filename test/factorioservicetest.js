var assert = require("assert");
var service = require("./../factoriodata.js").service;


describe('Db tests', function() {
	
	it('should connect and disconnect with db and result the dailyresults', function(done) {
	
		console.log(service);
		service.GetDayly(function (results){
			
			assert.ok(results.length > 0);
			done();
		});
	});
});