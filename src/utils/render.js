import ejs from 'ejs';
import util from 'util';

const render = util.promisify(ejs.renderFile);

export default async (filePath, data)=> {
    return await render(filePath, data);
}