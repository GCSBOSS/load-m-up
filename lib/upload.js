
const { resolve } = require('path');
const fs = require('fs').promises;
const { createReadStream } = require('fs');
const { createHash } = require('crypto');
const { valid, authorized, exist } = require('nodecaf').assertions;

const TOO_BIG_MSG = 'Max file size allowed of %d bytes';
const BLACKLISTED_MSG = 'MIME-TYPE %s is not allowed';
const NO_DATA_MSG = 'Missing file field on form data';
const NOT_ADMIN_MSG = 'Invalid access token';
const UNKNOWN_UPLOAD_MSG = 'Unconfirmed upload not found';
const NO_FILE_MSG = 'Requested file doesn\'t exist';

async function dirExist(path){
    try{
        return (await fs.readdir(path))[0];
    }
    catch(e){
        return false;
    }
}

module.exports = {

    async store({ req, res, conf }){

        let f = req.files.file;
        valid(f, NO_DATA_MSG);

        let limit = conf.sizeLimit;
        valid(!limit || f.size <= limit, TOO_BIG_MSG, limit);

        let wl = conf.whitelist;
        valid(!wl || wl.includes(f.type), BLACKLISTED_MSG, f.type);

        let bl = conf.blacklist;
        valid(!bl || !bl.includes(f.type), BLACKLISTED_MSG, f.type);

        let h = createHash('sha1').update(new Date() + f.name).digest('hex');
        let d = resolve(process.cwd(), conf.tmpDir, h);
        await fs.mkdir(d, { recursive: true });
        await fs.rename(f.path, d + '/' + f.name);

        res.status(201).end(h);

        setTimeout(async () => {
            await fs.unlink(d + '/' + f.name);
            await fs.rmdir(d);
        }, conf.confirmTimeout * 1000);
    },

    async confirm({ conf, body, res }){
        authorized(body.token == conf.accessToken, NOT_ADMIN_MSG);

        let d = resolve(process.cwd(), conf.tmpDir, body.hash);
        let f = await dirExist(d);
        valid(f, UNKNOWN_UPLOAD_MSG);

        let p = resolve(process.cwd(), conf.dir, body.hash);
        await fs.mkdir(p, { recursive: true });
        await fs.copyFile(d + '/' + f, p + '/' + f);

        res.status(201).end('/' + body.hash + '/' + f);
    },

    load({ params, conf, res, error }){
        let f = resolve(process.cwd(), conf.dir, params.hash, params.name);

        let stream = createReadStream(f);
        stream.on('error', () => error('NotFound', NO_FILE_MSG));
        stream.on('open', () => stream.pipe(res));
    }

};
