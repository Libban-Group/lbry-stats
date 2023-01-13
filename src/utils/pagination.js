export default async function pagination(path, fn, page=1) {
    let list = [];
    let total_pages = 0;

    try {
        // Fetch the page by running the function
        const resp = await (await fn(page)).json();
        list = findResult(resp, path); // Find the result
        total_pages = resp.result.total_pages; // Set total_pages to determine end of pages
    } catch (err) {
        // Log the error - the pagination will stop and return an empty list for this page
        console.log(err);
    }

    // Fetch all pages before returning
    return total_pages <= page ? list : list.concat(await pagination(path, fn, page+1));
}

function findResult(resp, path) {
    for (let i in path) {
        resp = resp[path[i]];
    }

    return resp;
}