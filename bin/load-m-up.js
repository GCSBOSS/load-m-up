#!node

const { run } = require('nodecaf');

run({
    init: require('../lib/main'),
    confPath: process.env['LOADMUP_CONF'] || undefined
});
