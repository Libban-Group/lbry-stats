import iplookup from "./iplookup.js";

async function API(method, params) {
    return await fetch("http://localhost:5279/", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            method,
            params
        })
    })
}

async function pagination(method, params) {
    let list = [];
    let cont = true;
    let page = 0;
    let total_pages = 0;

    while (cont) {
        try {
            params.page = page + 1;
            const resp = await (await API(method, params)).json();
            list = list.concat(resp.result.items);
            total_pages = resp.result.total_pages;
        } catch (err) {
            console.log(err);
        }

        page++;
        if (total_pages <= page) cont = false;
    }

    return list;
}

export default {
    "blob-peers": blob_peers,
    "peer-ping": peer_ping
}

async function blob_peers(query) {
    if (!query.query) return {"message": "expected query"};

    let resolve = await (await API('resolve', {urls: query.query})).json();
    resolve = Object.values(resolve.result)[0];
    let peer_list = await pagination('peer_list', {
        "blob_hash": resolve.value.source.sd_hash,
        "page_size": 50
    });

    peer_list = await iplookup(peer_list);

    return {
        title: resolve.value.title,
        channel: resolve.signing_channel.canonical_url ? resolve.signing_channel.canonical_url.split('lbry://')[1].replaceAll('#', ':') : undefined,
        claim_id: resolve.claim_id,
        claim_name: resolve.name,
        thumbnail: resolve.value.thumbnail ? resolve.value.thumbnail.url : '#',
        peers: peer_list
    };
}

async function peer_ping(query) {
    if (!query.address) return {"message": "expected address"};
    if (!query.port) return {"message": "expected port"};
    if (!query.node_id) return {"message": "expected node_id"};

    let ping;

    try {
        ping = await (await API('peer_ping', {address:query.address, port:query.port, node_id:query.node_id})).json();
    } catch {
        ping = {message: "error trying to ping"}
    }

    const resp = (await iplookup([query]))[0];

    if (ping.error) ping = {message: "error trying to ping"};

    resp.response = ping;

    return resp;
}

