import fs from 'fs';
import saveJSON from './saveJSON.js';
import logger from './logger.js';

export default (path, create=false) => {
    let json;
    try {
        json = JSON.parse(fs.readFileSync(new URL(process.cwd() + path, import.meta.url)));
    } catch (err) {
        logger('info', `It seems '.${path}' doesn't exist.`);
        if (create) {
            logger('info', 'Creating it...');
            saveJSON(path, {});
        }
    }
    return json;
}