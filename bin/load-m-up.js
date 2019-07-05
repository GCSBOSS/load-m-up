#!node

const { run } = require('nodecaf');
run({
    init: require('../lib/main'),
    confPath: 'test/localhost.toml'
});
