
const { AppServer } = require('nodecaf');
const api = require('./api');

module.exports = function init(){
    let app = new AppServer(__dirname + '/default.toml');
    app.api(api);
    return app;
}
