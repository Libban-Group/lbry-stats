import { Hono } from 'hono';
import dht_nodes from './endpoints/dht_nodes.js';
import claim from './endpoints/claim.js';
import peer_ping from './endpoints/peer_ping.js';
import channel from './endpoints/channel.js';


const api = new Hono();



api.get('/:endpoint', async (ctx)=>{
    if (!endpoints[ctx.req.paramData.endpoint]) return ctx.json({result: { error: `endpoint '${ctx.req.param.endpoint}' does not exist` }});

    return ctx.json({result: await endpoints[ctx.req.paramData.endpoint](ctx.req.query())});
});

api.post('/:endpoint', async (ctx)=>{
    if (!endpoints[ctx.req.paramData.endpoint]) return ctx.json({result: { error: `endpoint '${ctx.req.param.endpoint}' does not exist` }});

    let body = {};

    try {
        body = await ctx.req.json();
    } catch(err) {
        
    }

    return ctx.json({result: await endpoints[ctx.req.paramData.endpoint](body)});
});

api.all('/', (ctx)=>{
    return ctx.json({result: { message: 'hello world' }});
});

api.all('/*', (ctx)=>{
    ctx.status(404);
    return ctx.json({result: { error: `endpoint '${ctx.req.param.endpoint}' does not exist` }});
});

//if (!endpoints[ctx.req.paramData.endpoint]) return {"message": "endpoint does not exist"};

//return ctx.json({result: await endpoints[ctx.req.paramData.endpoint](ctx.body)});


const endpoints = {
    "dht-nodes": dht_nodes,
    "claim": claim,
    "peer-ping": peer_ping,
    "channel": channel
}


export default api;