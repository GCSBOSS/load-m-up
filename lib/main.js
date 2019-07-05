
const { AppServer } = require('nodecaf');
const api = require('./api');

module.exports = function init(conf){

    // Handle cnfig defaults ===

    let wl = conf.whitelist || [];
    conf.whitelist = wl.length == 0 ? false : wl;

    let bl = conf.blacklist || [];
    conf.blacklist = bl.length == 0 ? false : bl;

    conf.accessToken = process.env[conf.tokenEnvVar] || 'none';

    // ===

    let app = new AppServer(conf);

    let shared = {};
    app.expose(shared);

    app.onRouteError = function(input, err, send){

    };

    app.beforeStart = async function(){

    };

    app.afterStop = async function(){

    };

    app.api(api);

    return app;
}
