import fs from 'fs';

export default (path) => {
    let json;
    try {
        json = JSON.parse(fs.readFileSync(new URL(process.cwd() + path, import.meta.url)));
    } catch (err) {
        console.log(err);
    }
    return json;
}