var fs = require('fs');
var airport = require('./airport');
var iwlist = require('./iwlist');
var nmcli = require('./nmcli');
var netsh = require('./netsh');
var osLocale = require('os-locale');
var path = require('path');

var terms;

function setLocale(locale) {
    var shortLocale = locale.split('_')[0];
    var termsPath = path.join(__dirname, '../locales/' + shortLocale + '.json');
    if (!fs.existsSync(termsPath)) {
        shortLocale = 'en';
        termsPath = path.join(__dirname, '../locales/' + shortLocale + '.json');
    }
    terms = require(termsPath);
}

function scan(callback) {
    fs.stat(airport.utility, function (err, stats) {
        if (stats) {
            airport.scan(terms.airport, callback);
            return;
        }

        fs.stat(nmcli.utility, function (err, stats) {
            if(stats) {
                nmcli.scan(terms.nmcli, callback);
                return;
            }

            fs.stat(iwlist.utility, function (err, stats) {
                if (stats) {
                    iwlist.scan(terms.iwlist, callback);
                    return;
                }

                fs.stat(netsh.utility, function (err, stats) {
                    if (stats) {
                        netsh.scan(callback);
                        return;
                    }

                    callback("No scanning utility found", null);
                });
            });
        });
    });
}

var fullLocale = osLocale.sync({ spawn: true }) || 'en_US';
setLocale(fullLocale);

exports.scan = scan;
exports.setLocale = setLocale;
