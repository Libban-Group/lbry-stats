export default async (method, params)=> {
    return await fetch("http://localhost:5279/", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            method,
            params
        })
    })
}