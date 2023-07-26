export default async function pagination(path, fn, page=1) {
    let list = [];

    try {
        // Fetch the page by running the function
        const resp = await (await fn(page));
        list = findResult(resp, path); // Find the result
    } catch (err) {
        // Log the error - the pagination will stop and return an empty list for this page
        console.log(err);
    }

    // Fetch all pages before returning
    return !list.length ? list : list.concat(await pagination(path, fn, page+1));
}

function findResult(resp, path) {
    for (let i in path) {
        resp = resp[path[i]];
    }

    return resp;
}