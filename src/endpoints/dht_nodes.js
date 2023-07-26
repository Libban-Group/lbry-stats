import LBRY from '../utils/LBRY.js';
import iplookup from '../utils/iplookup.js';

export default async ()=> {
    return await getNodes();
}

async function getNodes() {
    let resp = {};

    try {
        const nodes = await LBRY('routing_table_get');

        if (nodes.error) return nodes; // Return if error from SDK

        // Convert the buckets object to a list
        const buckets = Object.values(nodes.buckets);
        resp.nodes = [];

        // Combine all buckets into one list
        buckets.forEach(bucket =>{
            resp.nodes = resp.nodes.concat(bucket);
        })

        // Add total_nodes
        resp.total_nodes = resp.nodes.length;

        // Add geoip info
        resp.nodes = await iplookup(resp.nodes);

        return {"dht-nodes": {nodes: resp.nodes, total_nodes: resp.nodes.length}};
    } catch (err) {
        console.log(err);
        return {error: "could not fetch data"};
    }
}