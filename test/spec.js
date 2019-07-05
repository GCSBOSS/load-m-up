const wtf = require('wtfnode');
const assert = require('assert');
const { post, get, patch, del } = require('muhb');

const delay = s => new Promise(done => setTimeout(done, s * 1000));
const init = require('../lib/main');

const LOCAL_HOST = 'http://localhost:80/';



describe('Load m Up', function(){

    let app;

    beforeEach(async function(){
        app = init({});
        await app.start();
    });

    afterEach(async function(){
        await app.stop();
    });

    describe('Startup', function(){

        it('Should boot just fine', async function(){
            let { status } = await get(LOCAL_HOST);
            assert.strictEqual(status, 404);
        });

    });

    describe('GET /upload/:hash/:name', function(){

        it('Should ...', async function(){
            let { status, headers, body } = await get(LOCAL_HOST);
            console.log(status, headers, body);
        });

    });

    describe('POST /confirmation', function(){

    });

    describe('POST /upload', function(){

    });

    describe('Settings', function(){





    });

});

process.on('SIGINT', () => wtf.dump());
