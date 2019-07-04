const { accept } = require('nodecaf');
const Upload = require('./upload');

module.exports = function({ post, get }){

    this.accept('json');

    get('/upload/:hash/:name', Upload.load);
    post('/upload', accept('form'), Upload.store);
    post('/confirmation', accept('json'), Upload.confirm);

}
