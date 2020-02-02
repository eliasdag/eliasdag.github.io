var http = require('http');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var request = require('request');
var async = require('async');
var rp = require('request-promise');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.get('/', function(req, res){
    var data = {};
    var data2 = {};
    var data3 = {};
    var stats = [];
    var promises = [];
    var apiKey = 'RGAPI-38981d7f-58cd-421c-9688-aa0fdc141128';
    var summonerName = 'xSamdavagx';
    var URL = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerName + '?api_key=' + apiKey;

    async.waterfall([
        function(callback) {
            request(URL, function(err, response, body) {
                if (!err && response.statusCode==200) {
                    var json = JSON.parse(body);
                    data.id = json.id;
                    data.name = json.name;
                    data.level = json.summonerLevel;
                    data.accountId = json.accountId;
                    callback(null, data);
                } else {
                    console.log(err);
                }
            });
        },
        function(obj, callback) {
            var accountId = obj.accountId;
            var URL2 = 'https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId + '?api_key=' + apiKey;
            request(URL2, function(err, response, body) {
                if(!err && response.statusCode==200) {
                    var json2 = JSON.parse(body);
                    data2.totalGames = json2.totalGames;
                    data2.listofGames = json2.matches;
                    callback(null, obj, data2);
                } else {
                    console.log(err)
                }
            });
        },
        function(obj1, obj2, callback) {
            //obj1 = data and obj2 = data2
            // get all list of games from data2.listofGames
            //obj2.listofGames; 
            var myRequests = [];
            var limit = 1;
            obj2.listofGames.forEach(element => {
                var gameId = element.gameId;
                var URL3 = 'https://na1.api.riotgames.com/lol/match/v4/matches/' + gameId + '?api_key=' + apiKey;
                if (limit < 4){
                    myRequests.push(rp(URL3));
                    limit++;
                }
            });
            Promise.all(myRequests)
            .then((arrayOfRequests) => {
                // console.log('we got here');
                // console.log(arrayOfRequests[0]);
                arrayOfRequests.forEach(element => {
                    console.log('here');
                    var json3 = JSON.parse(element);
                    var id = 0;
                    console.log('Success');
                    // console.log(json3.participantIdentities);
                    // console.log("a" + json3.participantIdentities);
                    // console.log("b" + obj1.accountId);
                    json3.participantIdentities.forEach(element2 => {
                        // console.log(json3.participantIdentities);
                        // console.log("c" + element2.player.accountId);
                        // console.log("d" + obj1.accountId);
                        // console.log("e" + element.participantId);
                        if (element2.player.accountId == obj1.accountId) {
                            id = element2.participantId;
                        }
                    });
                    // console.log("f" + json3.participants);
                    json3.participants.forEach(element3 => {
                        // var json4 = JSON.parse(element);
                        // console.log(element3.stats.participantId);
                        if (element3.stats.participantId == id) {
                            // console.log('shou;d print stats');
                            // console.log("h" + element.stats);
                            // console.log("i" + gameId);
                            // 
                            stats.push({kills: element3.stats.kills}, {win: element3.stats.win}, {deaths: element3.stats.deaths}, {assists: element3.stats.assists});
                            // console.log(stats);
                            // console.log(data3);
                        }
                    });
                    // console.log(stats);
                    // console.log("j" + stats);
                })
                //callback(null, obj1, obj2, stats);
                callback(null, obj1, obj2, stats);
                // console.log(stats);
                // myJSON = JSON.stringify(stats);
        }).catch(function (err){
            console.log('Error');
        });
            // Promise.all(promises).then(() => { callback(null, obj1, obj2, stats) });
        }
    ],
function(err, data, data2, stats) {
        if(err){
            console.log(err);
            return;
        } 

        res.render('index', {
            info: data,
            info3: stats, 
            info2: data2
        });
    });
});

var port = Number(process.env.PORT || 3000);
app.listen(port);

// http.createServer(app.handleRequests).listen(8080);