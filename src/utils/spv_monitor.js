import SpvSession from "../classes/SpvSession";

export async function addMonitor(server) {
    // Validate server string
    server = server.split('');
    if (server.length !== 2) server.push("50001") // return { error: "invalid server address"};
    try {
        server[1] = parseInt(server[1]);
    } catch {
        return { error: "invalid port value"};
    }

    // Server string is validated
    return await sendRequest(server);
}

export function monitor(server) {
    return sendRequest(server);
}

export function verifyAddress(server) {
    server = server.split(':');
    if (server.length !== 2) server.push("50001") // return { error: "invalid server address"};
    try {
        server[1] = parseInt(server[1]);
    } catch {
        return { error: "invalid port value"};
    }

    return server;
}

export async function sendRequest(server) {
    const session = new SpvSession();
    try {
        const data = await session.connect(server);
        session.disconnect();
        return data;
    } catch {
        return { error: "failed to communicate with server"};
    }
}