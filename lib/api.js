const Upload = require('./upload');

module.exports = function({ accept, post, get }){

    this.accept('json');

    get('/upload/:hash/:name', Upload.load);
    post('/upload', accept('form'), Upload.store);
    post('/confirmation', Upload.confirm);

}
