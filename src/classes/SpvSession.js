/*
 * Class that manages the SPV connection
*/

import Spv from "./Spv.js";

export default class SpvSession {

  constructor(log=true, timeout=5) {
    this.timeout = timeout;
    this.running = false;
    this.log = log;
    this.keepAliveId;
  }

  async connect(server) {
    this.connection = new Spv(server, this.log, this.timeout);
    await this.connection.connect();

    // Potentially try and do those calls simultaneously?
    const ping = await this.ping();
    const height = await this.sendRequest('blockchain.block.get_server_height');
    const features = await this.sendRequest('server.features');
    
    const resp = {
        ping,
        height,
        genesis_hash: features.genesis_hash,
        version: [features.server_version, features.protocol_max],
        address: this.connection.getRemoteAddress()
    }

    return resp;
    // this.keepAlive();
  }

  disconnect() {
    this.running = false;
    clearInterval(this.keepAliveId);
    this.connection.disconnect();
  }

  kill() {
    delete this.connection;
    delete this;
  }

  async ping() {
    const p = await this.connection.ping();
    console.log(`Latency to ${this.connection.server.join(':')} was ${p}ms.`);
    return p;
  }

  async sendRequest(method, params=[]) {
    const startTime = performance.now();
    const resp = this.connection.sendRequest(method, params);
    const endTime = performance.now();
    // this.responseTime = endTime - startTime;

    return resp;
  }

  async keepAlive() {
    try {
      this.keepAliveId = setInterval(async ()=>{
        // if (!this.running) return clearInterval(this.keepAliveId);
        await this.sendRequest('server.ping');
        // logger.info("sent keepalive ping");
      }, 1000 * 30);
    } catch (err) {
      logger.err(err);
    }
  }
}
