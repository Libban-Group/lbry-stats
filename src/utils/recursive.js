export default async function recursive(params, fn) {
    params.order_by = ["^creation_height"];
    let count = 0;
    let items = [];

    while (true) {
        console.log("Recursion level: " + count);
        const newItems = await fn(params);
        if (newItems.length === 0) break;
        items = items.concat(newItems);
        params.creation_height = ">" + newItems[newItems.length-1].meta.creation_height;
        count++;
    }

    return items;
}