import LBRY from '../utils/LBRY.js';
import pagination from '../utils/pagination.js'
import iplookup from '../utils/iplookup.js';

export default async (body)=> {
    if (!body.claim) return {"message": "expected claim"};

    const resolve = await LBRY('resolve', {urls: body.claim});

    // Return error if received
    if (resolve.error) return resolve;

    const claim = resolve[body.claim];

    // Return error if received
    if (claim.error) return {error: claim.error.text};

    // Make sure the claim is of type stream
    if (claim.value_type !== "stream") return { error: "not a stream" };

    let peers = await pagination(['items'], async (page)=>{
        return await LBRY('peer_list', {
            "blob_hash": claim.value.source.sd_hash,
            "page_size": 50,
            "page": page
        });
    });

    // Add geoip information to the peer_list
    peers = await iplookup(peers);

    return { claim: {...claim, peers, total_peers: peers.length} };

    /*return {
        title: claim.value.title,
        channel: claim.signing_channel ? claim.signing_channel.canonical_url.split('lbry://')[1].replaceAll('#', ':') : undefined,
        claim_id: claim.claim_id,
        claim_name: claim.name,
        thumbnail: claim.value.thumbnail.url ? claim.value.thumbnail.url : '#',
        peers: peer_list
    };*/
}