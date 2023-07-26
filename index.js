import api from './src/api.js';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';

const app = new Hono({ strict: false });

app.use('*', logger());

app.route('/api', api);

app.use('*', serveStatic({ root: './dist/' }));

app.notFound((c) => {
  c.status(404);
  return c.html(Bun.file('./dist/404.html'));
})

export default app

/*const app = new Elysia()
  .use(staticPlugin({noExtension: true, prefix: '', assets: './dist/'}))
  //.use(ssr)
  .get("/api/:endpoint", api)
  .listen(process.env.PORT || 3000);*/

/*app.onError(({ code, error, set }) => {
  if (code === 'NOT_FOUND') {
      set.status = 404
  
      return 'Not Found :('
  }
})*/
/*
app.on('request', (ctx)=>{
  console.log(ctx.set);
})

app.get('/', () => Bun.file(`./dist/index.html`));

getDirectories('./src/pages').map(page=>{
  app.get(`/${page}`, () => {
    const html = Bun.file(`./dist/${page}/index.html`);
    return html.size ? html :  Bun.file(`./dist/404.html`);
  });
})*/

// Log requests
/*app.onBeforeHandle((ctx) => {
  console.log(ctx);
  logger('info', `${ctx.method} ${new URL(ctx.url).pathname}`);
  return;
});*/

// Enable pages
//pages(app);

console.log("LBRY Statistics started");