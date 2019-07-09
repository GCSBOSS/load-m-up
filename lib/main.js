
const { AppServer } = require('nodecaf');
const api = require('./api');

module.exports = function init(){

    let app = new AppServer(__dirname + '/default.toml');

    // Handle cnfig defaults ===

    //let wl = conf.whitelist;
    //conf.whitelist = wl.length == 0 ? false : wl;

    //let bl = conf.blacklist;
    //conf.blacklist = bl.length == 0 ? false : bl;


    // ===


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
