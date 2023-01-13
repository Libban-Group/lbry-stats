import sdk_nodes from './endpoints/sdk_nodes.js';
import blob_peers from './endpoints/blob_peers.js';
import peer_ping from './endpoints/peer_ping.js';
import API from './utils/LBRY.js';
import iplookup from "./utils/iplookup.js";

export default {
    "sdk-nodes": sdk_nodes,
    "blob-peers": blob_peers,
    "peer-ping": peer_ping
}



