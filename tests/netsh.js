'use strict';

var fs = require('fs');
var assert = require('assert');

var netsh = require('../lib/netsh');

describe('Netsh', function() {
	var locales = ['en', 'de'];
	locales.forEach(function (locale) {
		it('parses ' + locale + ' locale output', function() {
			var aps = netsh.parse(fs.readFileSync('./tests/fixtures/netsh/' + locale + '.txt', { encoding: 'utf8' }));
			assert.ok(aps);
			assert.equal(aps.length, 5);
			var ap = aps[0];
			assert.equal(ap.mac, '00:aa:f2:77:a5:53');
			assert.equal(ap.ssid, 'AP-Test1');
			assert.equal(ap.signal_level, -77);
			assert.strictEqual(ap.channel, '6');
		});
	});
});

describe('Netsh complex test', function() {
	var locales = ['de', 'en'];
	locales.forEach(function (locale) {
		it('parses ' + locale + ' locale output', function() {
			var aps = netsh.parse(fs.readFileSync('./tests/fixtures/netsh/' + locale + '_complex.txt', { encoding: 'utf8' }));
			assert.ok(aps);
			assert.equal(aps.length, 86);

			var ap = aps[0];
			assert.equal(ap.mac, '00:f2:8b:8c:a6:88');
			assert.equal(ap.ssid, '');
			assert.equal(ap.signal_level, -88.5);
			assert.strictEqual(ap.channel, '1');

			ap = aps[22];
			assert.equal(ap.mac, '00:35:1a:5b:46:7b');
			assert.equal(ap.ssid, '');
			assert.equal(ap.signal_level, -90);
			assert.strictEqual(ap.channel, '116');

			ap = aps[23];
			assert.equal(ap.mac, '10:bd:18:ab:4d:8f');
			assert.equal(ap.ssid, 'Network-1');
			assert.equal(ap.signal_level, -81);
			assert.strictEqual(ap.channel, '6');

			ap = aps[74];
			assert.equal(ap.mac, '00:f2:8b:8c:a6:8d');
			assert.equal(ap.ssid, 'Network-6');
			assert.equal(ap.signal_level, -87.5);
			assert.strictEqual(ap.channel, '1');

			ap = aps[85];
			assert.equal(ap.mac, '00:f2:8b:8c:a6:85');
			assert.equal(ap.ssid, 'Network-7');
			assert.equal(ap.signal_level, -89.5);
			assert.strictEqual(ap.channel, '1');
		});
	});
});
