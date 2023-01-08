import fs from 'fs';

// Load a JSON file
export default (path, data) => {
    fs.writeFile(process.cwd() + path, JSON.stringify(data), 'utf8', (err)=>{
        console.log(err||`Updated '.${path}'.`);
    });
}