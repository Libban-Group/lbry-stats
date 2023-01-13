import LBRY from '../utils/LBRY.js';
import pagination from '../utils/pagination.js'
import iplookup from '../utils/iplookup.js';

export default async (query)=> {
    if (!query.query) return {"message": "expected query"};

    let resolve = await (await LBRY('resolve', {urls: query.query})).json();
    resolve = Object.values(resolve.result)[0];
    let peer_list = await pagination(['result', 'items'], async (page)=>{
        return await LBRY('peer_list', {
            "blob_hash": resolve.value.source.sd_hash,
            "page_size": 50,
            "page": page
        });
    });

    peer_list = await iplookup(peer_list);

    return {
        title: resolve.value.title,
        channel: resolve.signing_channel ? resolve.signing_channel.canonical_url.split('lbry://')[1].replaceAll('#', ':') : undefined,
        claim_id: resolve.claim_id,
        claim_name: resolve.name,
        thumbnail: resolve.value.thumbnail.url ? resolve.value.thumbnail.url : '#',
        peers: peer_list
    };
}