var exec = require('child_process').exec;
var systemRoot = process.env.SystemRoot || 'C:\\Windows';
var winProvider = systemRoot + '\\System32\\netsh.exe';

/**
 * Parsing netnsh output. Unfortunately netsh supplies the network information
 * in the language of the operating system. Translating the terms into every
 * language supplied is not possible, therefore this implementation follows
 * an approach of analyzing the structure of the output
 */
function parseNetsh(str) {
    var blocks = str.split('\n\n');
    var wifis = [];

    if (!blocks || blocks.length === 1) {
        // No WiFis found
        return [];
    }

    // Each block has the same structure, while some parts might be available and others
    // not. A sample structure:
    // SSID 1 : AP-Test1
    //     Network type              : Infrastructure
    //     Authentication            : WPA2-Personal
    //     Encryption                : CCMP
    //     BSSID 1                   : 00:aa:f2:77:a5:53
    //          Signal               : 46%
    //          Radio type           : 802.11n
    //          Channel              : 6
    //          Basic rates (MBit/s) : 1 2 5.5 11
    //          Other rates (MBit/s) : 6 9 12 18 24 36 48 54
    for (var i = 1, l = blocks.length; i < l; i++) {
        var network = {};
        var lines = blocks[i].split('\n');
        var regexChannel = /[a-zA-Z0-9()\s]+:[\s]*[0-9]+$/g;
        if (!lines || lines.length < 2) {
            continue;
        }

        // First line is always the SSID (which can be empty)
        var ssid = lines[0].substring(lines[0].indexOf(':') + 1).trim();

        for (var t = 1, n = lines.length; t < n; t++) {
            if (lines[t].split(':').length === 7) {
                // This is the mac address, use this one as trigger for a new network
                if (network.mac) {
                    wifis.push(network);
                }
                network = {
                    ssid: ssid,
                    mac: lines[t].substring(lines[t].indexOf(':') + 1).trim()
                };
            }
            else if (lines[t].indexOf('%') > 0) {
                // Network signal strength, identified by '%'
                var level = parseInt(lines[t].split(':')[1].split('%')[0].trim(), 10);

                // According to http://stackoverflow.com/q/15797920
                // Microsoft's signal quality is 0 to 100,
                // representing RSSI values between -100 and -50 dbm.
                network.signal_level = (level / 2) - 100;
            }
            else if(!network.channel) {
                // A tricky one: the channel is the first one having just ONE number. Set only
                // if the channel is not already set ("Basic Rates" can be a single number also)
                if (regexChannel.exec(lines[t])) {
                    // network.channel is defined as string in the interface, so we don't convert
                    // it to a number
                    network.channel = lines[t].split(':')[1].trim();
                }
            }
        }
        if (network) {
            wifis.push(network);
        }
    }
    return wifis;
}

function scan(callback) {
    exec(winProvider + ' wlan show networks mode=Bssid', function (err, stdout, stderr) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, parseNetsh(stdout));
    });
}

exports.scan = scan;
exports.utility = winProvider;
exports.parse = parseNetsh;
