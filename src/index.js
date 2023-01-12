import Bao from "baojs";
import api from './api.js';
import pages from './pages.js';
import serveStatic from "serve-static-bun";

const app = new Bao();

// Serve everything in the public directory at /public
app.get("/public/*any", serveStatic("public", { middlewareMode: "bao", stripFromPathname: "/public" }));

app.post("/api/:endpoint", async (ctx) => {
    const json = await ctx.req.json();

    if (!api[ctx.params.endpoint]) return ctx.sendJson({"message": "endpoint does not exist"});
    
    const peers = await api[ctx.params.endpoint](json);

    return ctx.sendJson(peers);
});

// Enable pages
pages(app);

app.listen({ port: process.env.PORT || 3000 });
console.log("LBRY Statistics started");