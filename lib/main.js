
const { AppServer } = require('nodecaf');
const api = require('./api');

module.exports = function init(){
    let app = new AppServer(__dirname + '/default.toml');
    app.name = 'Load m Up';
    app.version = '0.1.0';
    app.api(api);
    return app;
}
