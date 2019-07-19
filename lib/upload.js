
const { resolve } = require('path');
const fs = require('fs').promises;
const { createReadStream } = require('fs');
const { createHash } = require('crypto');
const { valid, authorized } = require('nodecaf').assertions;

const
    TOO_BIG_MSG = 'Exceeded max file size allowed of %d bytes',
    ALL_TOO_BIG_MSG = 'Exceeded overall size limit of %d bytes',
    BLACKLISTED_MSG = 'MIME-TYPE %s is not allowed',
    NO_DATA_MSG = 'Missing file field on form data',
    NOT_ADMIN_MSG = 'Invalid access token',
    UNKNOWN_UPLOAD_MSG = 'Unconfirmed upload not found',
    NO_FILE_MSG = 'Requested file doesn\'t exist',
    TOO_MANY_MSG = 'Exceeded file limit of %d';

async function readDir(path){
    try{
        return await fs.readdir(path);
    }
    catch(e){
        return false;
    }
}

module.exports = {

    validate({ flash, conf, next }){
        flash.fileNames = '';

        for(let f of flash.files){

            let limit = conf.sizeLimit;
            valid(!limit || f.size <= limit, TOO_BIG_MSG, limit);

            let wl = conf.whitelist;
            valid(!wl || wl.includes(f.mimetype), BLACKLISTED_MSG, f.mimetype);

            let bl = conf.blacklist;
            valid(!bl || !bl.includes(f.mimetype), BLACKLISTED_MSG, f.mimetype);

            flash.fileNames += f.name;
        }
        next();
    },

    read({ flash, req, next, conf }){

        valid(req.files, NO_DATA_MSG);

        flash.files = [];
        for(let key in req.files)
            if(Array.isArray(req.files[key]))
                flash.files = flash.files.concat(req.files[key]);
            else
                flash.files.push(req.files[key]);

        let maxFiles = conf.multi ? conf.multiFileLimit : 1;
        valid(!maxFiles || flash.files.length <= maxFiles, TOO_MANY_MSG, maxFiles);

        if(conf.multi){
            let totalSize = flash.files.reduce( (a, c) => a + c.size, 0);
            let ok = !conf.multiSizeLimit || totalSize <= conf.multiSizeLimit;
            valid(ok, ALL_TOO_BIG_MSG, conf.multiSizeLimit);
        }

        next();
    },

    async store({ flash, res, conf }){

        let h = createHash('sha256').update(new Date() + flash.fileNames).digest('hex');
        let d = resolve(process.cwd(), conf.tmpDir, h);
        await fs.mkdir(d, { recursive: true });

        for(let f of flash.files)
            await fs.rename(f.tempFilePath, d + '/' + f.name);

        setTimeout(async () => {
            for(let f of flash.files)
                await fs.unlink(d + '/' + f.name);
            await fs.rmdir(d);
        }, conf.confirmTimeout * 1000);

        res.status(201).end(h);
    },

    async confirm({ conf, body, res }){

        let token = process.env.LOADMUP_TOKEN || 'none';
        authorized(body.token == token, NOT_ADMIN_MSG);

        let d = resolve(process.cwd(), conf.tmpDir, body.hash || 'none');
        let files = await readDir(d);
        valid(files, UNKNOWN_UPLOAD_MSG);

        let p = resolve(process.cwd(), conf.dir, body.hash);
        await fs.mkdir(p, { recursive: true });

        let paths = [];
        for(let f of files){
            paths.push('/' + body.hash + '/' + f);
            await fs.copyFile(d + '/' + f, p + '/' + f);
        }

        res.status(201).end(paths.join('\r\n'));
    },

    load({ params, conf, res, error }){
        let f = resolve(process.cwd(), conf.dir, params.hash, params.name);

        let stream = createReadStream(f);
        stream.on('error', () => error('NotFound', NO_FILE_MSG));
        stream.on('open', () => stream.pipe(res));
    }

};
