// import LBRY from '../utils/LBRY.js';
// import iplookup from '../utils/iplookup.js';
// import SpvSession from "../classes/SpvSession";
import { addSPV } from "../utils/monitor";

export default async (body)=> {
    const resp = await addSPV(body.server);

    return resp;
    // return await monitor(['a-hub1.odysee.com', 50001]);
    // return await getNodes();
}