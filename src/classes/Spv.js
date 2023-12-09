/*
 * Class that connects to the SPV server and handles communication
*/

function genHexString(len) {
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += (Math.floor(Math.random() * 16)).toString(16);
    }
    return output;
  }
  
  export default class Spv {
    #socket;
  
    constructor(server, log=true, timeout) {
      this.server = server;
      this.timeout = timeout * 1000;
      this.log = log;
    }
  
    async connect() {
  
      let t; // Id for the connection timeout
  
      // Establish a connection to the server
      this.#socket = await Promise.race([
        Bun.connect({
          hostname: this.server[0],
          port: this.server[1],
  
          socket: {
            // Handle incomming data stream
            data(socket, data) {
              // Clear old data
              if (((socket.lastData - performance.now()) * 1000) > 10) socket.data = new Array();
              socket.lastData = performance.now(); // Remember last data input
  
              // Append new data
              socket.data.push(data);
  
              // Only do more if the data is the end of a message
              if (!data.includes(Buffer.from('\n'))) return;
  
              // Concatenate the full data into one Buffer
              const buffer = Buffer.concat(socket.data);
              socket.data = new Array(); // Clear data
  
              // Try to recreate a JSONRPC response from the recieved data;
              let rpc;
              try {
                rpc = JSON.parse(buffer.toString());
              } catch (err) {
                console.error("Recieved data was corrupt!");
                return;
              }
  
              if (Object.keys(socket.events).includes(rpc.method)) {
                socket.events[rpc.method](rpc.params[0]);
              }
  
              if (Object.keys(socket.requests).includes(rpc.id)) {
                socket.requests[rpc.id](rpc);
              }
            },
            open(socket) {
              socket.requests = {}; // Store handlers for waiting requests
              socket.events = {}; // Store handlers for subscribed events
              socket.data = new Array(); // Temporary hold incomming data
              socket.lastData = performance.now();
            },
            close(socket) {
              //logger.info(`connection lost to ${socket.remoteAddress}`)
              //console.log(socket);
            },
            drain(socket) {
              //console.log(socket);
            },
            error(socket, error) {
              console.log(error);
            },
  
            // client-specific handlers
            connectError(socket, error) {
              console.log("connection error");
            }, // connection failed
            end(socket) {
            console.log(`connection to ${socket.remoteAddress} closed by server`);
              // console.log("end");
            }, // connection closed by server
            timeout(socket) {
              console.log(`connection to ${socket.remoteAddress} timed out`);
            }, // connection timed out
          }
        }),
        new Promise((_, reject) =>
          t = setTimeout(() => {
            if (log) logger.warn(`could not reach ${this.hostname}:${this.port}`)
            reject();
          }, this.timeout)
        )
      ]);
  
      clearTimeout(t);
  
      if (this.log && this.available()) console.log(`Connected to ${this.server.join(':')}`);
    }
  
    // Close the TCP connection
    disconnect(log=true) {
      this.#socket.flush();
      this.#socket.end();
      if (this.log) console.log(`Closed connection to ${this.server.join(':')}`)
    }
  
    available() {
      return this.#socket.readyState === 1;
    }
  
    getRemoteAddress() {
      return this.#socket.remoteAddress;
    }
  
    // Time the time it takes to ping the server (returns in milliseconds)
    async ping() {
      const startTime = performance.now();
      await this.sendRequest('server.ping');
      const endTime = performance.now();
      const time = endTime - startTime;
      return Math.floor((time - Math.floor(time)) * 10) > 4 ? Math.ceil(time) : Math.floor(time); // Round up if first decimal is over 4
    }
  
    async sendRequest(method, params) {
      const id = genHexString(32);
      let data;
  
      await new Promise((resolve, reject) => {
          this.#socket.requests[id] = (e) => {
              data = e;
              resolve();
              // TODO you might want to reject in case an error occurs here, so that your application won't halt
          }
  
          this.#socket.write(JSON.stringify({
              "jsonrpc": "2.0",
              "method": method,
              "params": params,
              "id": id
          }) + '\n');
  
          setTimeout(() => reject(new Error("Timeout")), this.timeout);
      });

      this.#socket.requests[id] = undefined;
      return data.result;
    }
  
  }
  