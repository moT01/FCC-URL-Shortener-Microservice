var mongo = require('mongodb').MongoClient;
var express = require('express');
var exists = require('url-exists');
var url = 'mongodb://localhost:27017/';
var app = express();

mongo.connect(url, function(err, db) {
	if (err) throw err
   console.log('Successfully connected to MongoDB via ' + url);


	//redirects to 'index.html' when no parameter is givin
	app.get('/', function(req,res) {
		res.sendFile('index.html', { root: __dirname });
	   console.log("Redirected to 'index.html'");
	}); //end app.get

	
	//when parameter is givin
  	app.get('/*', function (req,res) {
		var parameter = req.params[0];
		var collection = db.collection('shortURLS');
		console.log(parameter + ' entered');

		collection.findOne({ $or: [
         { 'original' : parameter },
         { 'short': parameter }
      ]},{ _id: 0 }, function (err, result) {

      	if (err) throw err

			if (result != null) {
				if (parameter == result.short) { //if parameter is in db as 'short'
					res.redirect(result.original);			
					console.log('Short URL entered redirecting to ' + result.original);
				
				} else if (parameter == result.original) { //if parameter is in db as 'original'
					res.json(result);
					console.log('Existing URL entered - returning DB entry');
				}
				
			} else if (result == null) { //if parameter not found in db
				exists(parameter, function(err, exists) {
					if (err) throw err
					
					if (exists) { //if parameter is valid url
						var newShort = Math.floor(Math.random() * 100000).toString();							
						collection.insert({'original': parameter, 'short': newShort});
						res.json({'original': parameter, 'short': newShort});
						console.log('New url entered - entry created in db');
					
					} else { //if (!exists)
						res.sendFile('index.html', { root: __dirname });
						console.log("Invalid URL entered - Redirected to 'index.html'");
					} //end if (exists)
				}); //end function(exists)
			} //end if (result == null)
		}); //end collection.findOne()
	}); //end app.get('/*')
	
	
	
	var port = process.env.PORT || 3000;
		
	app.listen(port, function(){
		console.log("Listening on port: " + port);
	}); //end app.listen
}); //end mongo.connect
