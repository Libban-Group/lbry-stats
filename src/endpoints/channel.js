import LBRY from '../utils/LBRY.js';
import db from '../utils/db.js';
import pagination from "../utils/pagination";
import recursive from "../utils/recursive";

db.run("CREATE TABLE IF NOT EXISTS channel (id INTEGER PRIMARY KEY AUTOINCREMENT, channel_id TEXT, claims_in_channel INTEGER, claims TEXT, created DATE NOT NULL DEFAULT CURRENT_DATE)");

export default async (body) => {
    if (!body.channel) return {"error": "expected channel"};

    // Resolve channel
    const resolve = await LBRY('resolve', {urls: body.channel});

    // Return error if received
    if (resolve.error) return resolve;

    const channel = resolve[body.channel];

    // Make sure the claim is of type channel
    if (channel.value_type !== "channel") return { error: "not a channel" };

    // Fetch claims
    const claims = await fetchClaims(channel);

    const storage = calcStorage(claims);

    return {channel: {...channel, claims, storage}};
}

async function paginate(params) {
    params.no_totals = true; // do not calculate the total number of pages and items in result set (significant performance boost)
    return await pagination(['items'], async (page)=>{
        params.page = page;
        return await LBRY('claim_search', params);
    });
}

async function fetchClaims(channel) {
    let claims;
    // Get claims from cache
    const cache = db.query("SELECT * FROM channel WHERE channel_id = ?;").get(channel.claim_id);

    if (cache) { // Use cache if exists
        if (cache.claims_in_channel === channel.meta.claims_in_channel && new Date(cache.created) > new Date().setDate(new Date().getDate() - 7)) {
            // Check if claims_in_channel haven't changed and cache is not older than 7 days
            console.log("Used cache for channel: " + channel.name);
            claims = JSON.parse(cache.claims);
        } else {
            // Remove obsolete claims and fetch again
            removeCache(cache.id);
            claims = await recursive({channel_ids: [channel.claim_id]}, paginate);
            claims = claims.map(claim=>{
                return {
                    title: (claim.value ? claim.value.title : undefined),
                    claim_name: claim.name, claim_id: claim.claim_id,
                    type: claim.type,
                    value_type: claim.value_type,
                    size: (claim.value && claim.value.source ? parseInt(claim.value.source.size) || 0 : undefined)
                };
            })
            addCache(channel, claims);
        }
    } else {
        claims = await recursive({channel_ids: [channel.claim_id]}, paginate);
        claims = claims.map(claim=>{
            return {
                title: (claim.value ? claim.value.title : undefined),
                claim_name: claim.name, claim_id: claim.claim_id,
                type: claim.type,
                value_type: claim.value_type,
                size: (claim.value && claim.value.source ? parseInt(claim.value.source.size) || 0 : undefined)
            };
        });
        addCache(channel, claims);
    }

    return claims;
}

function removeCache(id) {
    db.run("DELETE FROM channel WHERE id = ?", [id]);
}

function addCache(channel, claims) {
    db.run("INSERT INTO channel (channel_id, claims_in_channel, claims) VALUES (?, ?, ?)", [channel.claim_id, channel.meta.claims_in_channel, JSON.stringify(claims)]);
}

function calcStorage(claims) {
    let bytes = 0;

    const prefix = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    claims.forEach(claim=>{
        bytes += claim.size || 0;
    })

    let size = bytes;
    let i = 0;

    while (size > 1000) {
        size /= 1024;
        i++;
    }

    size = Math.ceil(size * 10) / 10;

    return {bytes, formatted: `${size} ${prefix[i]}`};
}