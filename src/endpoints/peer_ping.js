import LBRY from '../utils/LBRY.js';
import iplookup from '../utils/iplookup.js';

export default async (query) => {
    if (!query.address) return {"message": "expected address"};
    if (!query.port) return {"message": "expected port"};
    if (!query.node_id) return {"message": "expected node_id"};

    let ping;

    try {
        ping = await (await LBRY('peer_ping', {address:query.address, port:query.port, node_id:query.node_id})).json();
    } catch {
        ping = {message: "error trying to ping"}
    }

    const resp = (await iplookup([query]))[0];

    if (ping.error) ping = {message: "error trying to ping"};

    resp.response = ping;

    return resp;
}