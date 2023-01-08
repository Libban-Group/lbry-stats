import Bao from "baojs";
import render from './utils/render.js';
import api from './utils/api.js';
import serveStatic from "serve-static-bun";

const app = new Bao();

app.get("/public/*any", serveStatic("public", { middlewareMode: "bao", stripFromPathname: "/public" }));

app.post("/api/:endpoint", async (ctx) => {
    const json = await ctx.req.json();

    if (!api[ctx.params.endpoint]) return ctx.sendJson({"message": "endpoint does not exist"});
    
    const peers = await api[ctx.params.endpoint](json);

    return ctx.sendJson(peers);
});

app.get("/blob-peers", async (ctx) => {
    let res;
    try {
        // Get the query from URL
        const query = new URL(ctx.url).searchParams.get('q');
        res = new Response(await render('./views/blob-peers/index.ejs', {query}));
        res.headers.set('Content-Type', 'text/html; charset=utf-8');
    } catch (err) {
        res = new Response(err);
    }
    return ctx.sendRaw(res);
});

app.listen({ port: process.env.PORT || 3000 });