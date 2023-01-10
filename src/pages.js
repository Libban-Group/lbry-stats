import loadJSON from "./utils/loadJSON.js";
import render from './utils/render.js';

const pages = loadJSON("/data/pages.json") || [];
let compiled = {};

export default (app)=>{
    // Enable all endpoints
    for (let i in pages) {
        addEndpoint(app, pages[i]);
    }
}

// Enable endpoint
function addEndpoint(app, page) {
    const dir = (page === '/') ? '/index' : page
    app.get(page, async (ctx) => {
        let res;

        if (process.env.DEV === 'true') {
            res = await compilePage(dir, ctx);
        } else {
            if (!compiled[page]) {
                const comp = await compilePage(dir);
                compiled[page] = comp
                res = comp;
            } else {
                res = compiled[page];
            }
        }

        res = new Response(res);
        res.headers.set('Content-Type', 'text/html; charset=utf-8');
        return ctx.sendRaw(res);
    });
}

async function compilePage(dir) {
    let res;
    try {
        res = await render(`./views${dir}/index.ejs`, {query: ''});
    } catch (err) {
        res = err;
    }

    return res;
}