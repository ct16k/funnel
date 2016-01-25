var version = require('../version')
module.exports = {
    fromJsonUrl: function (url, callback) {
        var timeout_wrapper = function(req) {
            return function() { req.abort(); }
        }
        var parsed = require('url').parse(url);
        switch (parsed.protocol) {
            case 'http:':
                var protmod = require('http');
                break;
            case 'https:':
                var protmod = require('https');
                break;

            default:
                throw "Unsupported protocol in " + url;
        }
        parsed['user-agent'] = 'Funnel/' + version + ' node.js/' + process.version
        var request = protmod.get(parsed, function(res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
                clearTimeout(timeout);
                timeout = setTimeout(fn, 10000);
            });
            res.on('end', function() {
                try {
                    clearTimeout(timeout);
                    body = JSON.parse(body);
                } catch (e) {
                    throw "Invalid JSON returned from " + url;
                }
                callback(body, parsed);
            });
            res.on('error', function(err) {
                clearTimeout(timeout);
                callback(err, null);
            });
        });
        var fn = timeout_wrapper(request);
        var timeout = setTimeout(fn, 10000);
    },
    dbiSolo: function (result) {
        if (result && result[0]) {
            return result[0][Object.keys(result[0])[0]];
        }
    },
    ALL: '__funnel.ALL__',
    COUNT: '__funnel.COUNT__',
    nocb: function(){}
}



