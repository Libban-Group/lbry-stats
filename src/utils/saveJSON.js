import fs from 'fs';
import logger from './logger.js';

// Load a JSON file
export default (path, data) => {
    fs.writeFile(process.cwd() + path, JSON.stringify(data), 'utf8', (err)=>{
        logger(err ? 'error' : 'info', `Updated '.${path}'.`);
    });
}