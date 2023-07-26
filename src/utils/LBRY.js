// Make an request to lbrynet
// To use a custom endpoint - set the LBRYNET variable in the .env file
export default async (method, params)=> {
    let resp = {};
    try {
        resp = await fetch(process.env.LBRYNET || "http://localhost:5279/", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method,
                jsonrpc: "2.0",
                params
            })
        });

        return (await resp.json()).result;
    } catch (err) {
        console.log(err);
        return {error: "could not talk to sdk"};
    }
}