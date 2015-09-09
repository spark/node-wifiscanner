var fs = require('fs');
var airport = require('./airport');
var iwlist = require('./iwlist');
var netsh = require('./netsh');
var osLocale = require('os-locale');

var terms;

function setLocale(locale) {
    var shortLocale = locale.split('_')[0];
    var path = '../locales/' + shortLocale + '.json';
    if (!fs.existsSync(path)) {
        shortLocale = 'en';
        path = '../locales/' + shortLocale + '.json';
    }
    terms = require(path);
}

function scan(callback) {
    fs.exists(airport.utility, function (exists) {
        if (exists) {
            airport.scan(terms.airport, callback);
            return;
        }

        fs.exists(iwlist.utility, function (exists) {
            if (exists) {
                iwlist.scan(terms.iwlist, callback);
                return;
            }

            fs.exists(netsh.utility, function (exists) {
                if (exists) {
                    netsh.scan(terms.netsh, callback);
                    return;
                }

                callback("No scanning utility found", null);
            });
        });
    });
}

var fullLocale = osLocale.sync({ spawn: false }) || 'en_US';
setLocale(fullLocale);

exports.scan = scan;
exports.setLocale = setLocale;
