const wtf = require('wtfnode');
const fs = require('fs');
const assert = require('assert');
const Tempper = require('tempper');
const FormData = require('form-data');
const { post, get } = require('muhb');

const delay = s => new Promise(done => setTimeout(done, s * 1000));
const parseBody = res => new Promise(resolve => {
    let body = '';
    res.on('data', data => body += data.toString());
    res.on('end', () => resolve(body));
});

const init = require('../lib/main');

const LOCAL_HOST = 'http://localhost:80/';

describe('Load m Up', function(){

    let tmp, app;

    before(function(){
        process.chdir('./test');
        tmp = new Tempper();
        tmp.mkdir('uploads/tmp');
    });

    after(function(){
        tmp.clear();
    });

    beforeEach(async function(){
        app = init();
        await app.start();
    });

    afterEach(async function(){
        await app.stop();
        tmp.refresh();
    });

    describe('Startup', function(){

        it('Should boot just fine', async function(){
            let { status } = await get(LOCAL_HOST);
            assert.strictEqual(status, 404);
        });

    });

    describe('GET /upload/:hash/:name', function(){

        it('Should return a not found error if file is not in the server', async function(){
            let { status, body } = await get(LOCAL_HOST + 'upload/hash/upload.txt');
            assert.strictEqual(status, 404);
            assert(/file doesn\'t/.test(body));
        });

        it('Should return the file stored in the server', async function(){
            tmp.mkdir('uploads/hash');
            tmp.addFile('./res/upload.txt', './uploads/hash/upload.txt');
            let { status, body } = await get(LOCAL_HOST + 'upload/hash/upload.txt');
            assert.strictEqual(status, 200);
            assert.strictEqual(body.replace(/\s+/g, ''), 'foobar');
        });

    });

    describe('POST /confirmation', function(){

        it('Should return an unauthorized error when token doesn\'t match', async function(){
            let { status, body } = await post(LOCAL_HOST + 'confirmation');
            assert.strictEqual(status, 401);
            assert(/Invalid access token/.test(body));
        });

        it('Should return an invalid input error when temp upload doesn\'t exist', async function(){
            let { status, body } = await post(
                LOCAL_HOST + 'confirmation',
                { 'Content-Type': 'application/json' },
                '{"token":"none"}'
            );
            assert.strictEqual(status, 400);
            assert(/not found/.test(body));
        });

        it('Should copy temp upload to persistent dir', async function(){
            tmp.mkdir('uploads/tmp/my-hash');
            tmp.addFile('./res/upload.txt', './uploads/tmp/my-hash/upload.txt');
            let { status, body } = await post(
                LOCAL_HOST + 'confirmation',
                { 'Content-Type': 'application/json' },
                '{"token":"none","hash":"my-hash"}'
            );
            tmp.assertExists('uploads/my-hash/upload.txt');
            assert.strictEqual(status, 201);
            assert.strictEqual(body, '/my-hash/upload.txt');
        });

    });

    describe('POST /upload', function(){

        it('Should return bad request error when body IS NOT form-data', async () => {
            let { status, body } = await post(
                LOCAL_HOST + 'upload',
                { 'Content-Type': 'application/json' },
                '{"token":"none","hash":"my-hash"}'
            );
            assert.strictEqual(status, 400);
            assert(/Unsupported/.test(body));
        });

        it('Should return invalid input error when no body is sent', async () => {
            let { status, body } = await post(LOCAL_HOST + 'upload');
            assert.strictEqual(status, 400);
            assert(/Missing file field/.test(body));
        });

        it('Should store the sent file temporarily', function(done){
            this.timeout(8000);
            tmp.addFile('./res/upload.txt', 'upload.txt');

            let form = new FormData();
            form.append('file', fs.createReadStream('./upload.txt'));
            form.submit(LOCAL_HOST + 'upload', async (err, res) => {
                let body = await parseBody(res);
                assert.strictEqual(res.statusCode, 201);
                assert.strictEqual(body.length, 40);
                tmp.assertExists('uploads/tmp/' + body + '/upload.txt');
                await delay(7);
                tmp.assertMissing('uploads/tmp/' + body + '/upload.txt');
                done();
            });
        });

    });

    describe('Settings', function(){

        it('Should remove tmp upload after setup amount of time [confirmTimeout] ', function(done){
            app.setup({ confirmTimeout: 1 });

            this.timeout(3000);
            tmp.addFile('./res/upload.txt', 'upload.txt');

            let form = new FormData();
            form.append('file', fs.createReadStream('./upload.txt'));
            form.submit(LOCAL_HOST + 'upload', async (err, res) => {
                let body = await parseBody(res);
                tmp.assertExists('uploads/tmp/' + body + '/upload.txt');
                await delay(2);
                tmp.assertMissing('uploads/tmp/' + body + '/upload.txt');
                done();
            });
        });

        it('Should return the file stored in the setup dir [dir]', async function(){
            app.setup({ dir: './ups/' });

            tmp.mkdir('ups/my-hash');
            tmp.addFile('./res/upload.txt', './ups/my-hash/upload.txt');
            let { status, body } = await get(LOCAL_HOST + 'upload/my-hash/upload.txt');
            assert.strictEqual(status, 200);
            assert.strictEqual(body.replace(/\s+/g, ''), 'foobar');
        });

        it('Should copy temp upload to setup dir [dir] [tmpDir]', async function(){
            app.setup({ dir: './ups/', tmpDir: './tups' });

            tmp.mkdir('ups');
            tmp.mkdir('tups/my-hash');
            tmp.addFile('./res/upload.txt', './tups/my-hash/upload.txt');
            let { status, body } = await post(
                LOCAL_HOST + 'confirmation',
                { 'Content-Type': 'application/json' },
                '{"token":"none","hash":"my-hash"}'
            );
            tmp.assertExists('ups/my-hash/upload.txt');
            assert.strictEqual(status, 201);
            assert.strictEqual(body, '/my-hash/upload.txt');
        });

        it('Should store the sent file temporarily on setup dir [tmpDir]', function(done){
            app.setup({ tmpDir: './tups/', confirmTimeout: 1 });

            tmp.mkdir('tups');
            this.timeout(3000);
            tmp.addFile('./res/upload.txt', 'upload.txt');

            let form = new FormData();
            form.append('file', fs.createReadStream('./upload.txt'));
            form.submit(LOCAL_HOST + 'upload', async (err, res) => {
                let body = await parseBody(res);
                assert.strictEqual(res.statusCode, 201);
                assert.strictEqual(body.length, 40);
                tmp.assertExists('tups/' + body + '/upload.txt');
                await delay(2);
                tmp.assertMissing('tups/' + body + '/upload.txt');
                done();
            });
        });

        it('Should deny uploads that exceed the setup size limit [sizeLimit]', function(done){
            app.setup({ sizeLimit: 3 });

            tmp.addFile('./res/upload.txt', 'upload.txt');

            let form = new FormData();
            form.append('file', fs.createReadStream('./upload.txt'));
            form.submit(LOCAL_HOST + 'upload', async (err, res) => {
                let body = await parseBody(res);
                assert.strictEqual(res.statusCode, 400);
                assert(/Exceeded max/.test(body));
                done();
            });
        });

        it('Should allow access with setup token [tokenEnvVar]', async function(){
            app.setup({ tokenEnvVar: 'MY_TOKEN' });
            process.env.MY_TOKEN = 'foo';

            let { body: b } = await post(
                LOCAL_HOST + 'confirmation',
                { 'Content-Type': 'application/json' },
                '{"token":"none","hash":"my-hash"}'
            );
            assert(/Invalid access token/.test(b));

            tmp.mkdir('uploads/tmp/my-hash');
            tmp.addFile('./res/upload.txt', './uploads/tmp/my-hash/upload.txt');
            let { status, body } = await post(
                LOCAL_HOST + 'confirmation',
                { 'Content-Type': 'application/json' },
                '{"token":"foo","hash":"my-hash"}'
            );
            assert.strictEqual(status, 201);
            assert.strictEqual(body, '/my-hash/upload.txt');
        });

        it('Should deny mime-types not present on the whitelist [whitelist]', function(done){
            app.setup({ whitelist: [ 'application/json' ] });

            tmp.addFile('./res/upload.txt', 'upload.txt');

            let form = new FormData();
            form.append('file', fs.createReadStream('./upload.txt'), { contentType: 'text/plain' });
            form.submit(LOCAL_HOST + 'upload', async (err, res) => {
                let body = await parseBody(res);
                assert.strictEqual(res.statusCode, 400);
                assert(/not allowed/.test(body));
                done();
            });
        });

        it('Should deny mime-types present on the blacklist [blacklist]', function(done){
            app.setup({ blacklist: [ 'text/plain' ] });

            tmp.addFile('./res/upload.txt', 'upload.txt');

            let form = new FormData();
            form.append('file', fs.createReadStream('./upload.txt'), { contentType: 'text/plain' });
            form.submit(LOCAL_HOST + 'upload', async (err, res) => {
                let body = await parseBody(res);
                assert.strictEqual(res.statusCode, 400);
                assert(/not allowed/.test(body));
                done();
            });
        });

    });

});

process.on('SIGINT', () => wtf.dump());
