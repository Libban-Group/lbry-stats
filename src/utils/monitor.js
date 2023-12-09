import db from '../utils/db.js';
import { verifyAddress as verifySPVAddress, sendRequest as sendSPVRequest } from "../utils/spv_monitor.js";

const GENESIS_HASH = "9c89283ba0f3227f6c03b70216b9f665f0118d5e0fa729cedf4fb34d6a34f463";

db.query("CREATE TABLE IF NOT EXISTS spvSubs (id INTEGER PRIMARY KEY AUTOINCREMENT, hostname TEXT, port INTEGER, address TEXT, height INTEGER, ping INTEGER, serverVersion REAL, protocolMax REAL, created DATE NOT NULL DEFAULT CURRENT_DATE)").run();
db.query("CREATE TABLE IF NOT EXISTS monitor (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, node INTEGER, ping INTEGER, success BOOLEAN, date DATE NOT NULL DEFAULT CURRENT_DATE)").run();

export async function monitor() {
    const spv = await db.query("SELECT * FROM spvSubs;").all();

    spv.forEach(async s=>{
        const data = await sendSPVRequest([s.hostname, s.port]);
        db.run("INSERT INTO monitor (type, node, ping, success) VALUES (?, ?, ?, ?)", ["spv", s.id, data.ping, true]);
        console.log(data);
    })

    console.log(await pingSPV(["hub.lizard.technology", 50001]));
}

export async function addSPV(server) {
    server = verifySPVAddress(server); // Verify the Address

    if (typeof server === 'object' && server.error) return server; // Return error if the address is invalid

    // Check if the SPV is already monitored
    const check = db.query("SELECT * FROM spvSubs WHERE hostname = ? AND port = ?;").get([server[0], server[1]]);
    if (check) return { message: "success"};

    // Send requests to SPV (we only want one entry per SPV)
    const resp = await sendSPVRequest(server);
    if (resp.error) return resp;

    if (resp.genesis_hash !== GENESIS_HASH) return { error: "not serving LBRY"};

    db.run("INSERT INTO spvSubs (hostname, port, address, height, ping, serverVersion, protocolMax) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [server[0], server[1], resp.address, resp.height, resp.ping, resp.version[0], resp.version[1]]);

    return { message: "success"};
}

export async function pingSPV(server) {
    const resp = await sendSPVRequest(server);
    if (resp.error) return resp;

    return resp;
}