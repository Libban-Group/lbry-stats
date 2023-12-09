// import LBRY from '../utils/LBRY.js';
import iplookup from '../utils/iplookup.js';
import { sendRequest } from "../utils/spv_monitor.js";
// import SpvSession from "../classes/SpvSession";
// import { monitor } from "../utils/monitor.js";
import db from "../utils/db";


export default async ()=> {
    // monitor();
    let nodes = await db.query("SELECT * FROM spvSubs;").all();

    for (let i in nodes) {
        const data = await sendRequest([nodes[i].hostname, nodes[i].port]);
        nodes[i].online = data.error ? false : true;
    }

    // nodes = await nodes.map(async node=>{
    //     const data = await sendRequest([node.hostname, node.port]);
    //     node.online = data.error ? false : true;
    // })
    console.log(nodes);

    return {
        nodes: await iplookup(nodes),
        monitor: []};
    // return await monitor(['a-hub1.odysee.com', 50001]);
    // return await getNodes();
}