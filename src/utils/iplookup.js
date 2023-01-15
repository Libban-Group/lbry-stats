import loadJSON from './loadJSON.js';
import saveJSON from './saveJSON.js';
import logger from './logger.js';

// Load known geoip information
const known_geoip = loadJSON('/data/known_geoip.json') || {};

// Load cached geoip information
let cache_geoip = loadJSON('/data/cache_geoip.json', true) || {};

// Load IP ranges
const ip_ranges = loadJSON('/data/ip_ranges.json') || {};

export default async (ip_list)=>{
    let updated = 0;
    
    for (const i in ip_list) {

        // Use known_geoip if exist
        if (known_geoip[ip_list[i].address]) {
            ip_list[i].geo = known_geoip[ip_list[i].address];
            continue;
        }

        // Use cache_geoip if exist and valid
        if (cache_geoip[ip_list[i].address] && new Date(cache_geoip[ip_list[i].address].expire) > Date.now()) {
            ip_list[i].geo = cache_geoip[ip_list[i].address];

            // Try add a tag to the details if possible
            if (!ip_list[i].geo.details) {
                ip_list[i].geo.details = ipRangeCheck(ip_list[i].address);
                updated++;
            }

            continue;
        }

        try {
            const geo = await (await fetch('https://get.geojs.io/v1/ip/geo/' + ip_list[i].address + '.json')).json();
            ip_list[i].geo = {
                country: geo.country,
                countryCode: geo.country_code,
                region: geo.regionName,
                city: geo.city,
                timezone: geo.timezone,
                organization: geo.organization_name,
                isp: geo.isp,
                expire: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // Expire in 7 days
            };

            // Can we tag the IP to an IP range?
            ip_list[i].geo.details = ipRangeCheck(ip_list[i].address);

            // Add to cache_geoip
            cache_geoip[ip_list[i].address] = ip_list[i].geo;

            // Update the known_geoip.json file
            updated++;
        } catch (err) {
            console.log(err);
        }
    }
    
    // Update cache_geoip.json
    if (updated) {
        logger('info', `Made ${updated} IPLookup${updated > 1 ? 's' : '' }`)
        saveJSON('/data/cache_geoip.json', cache_geoip);
    }
    return ip_list;
}

function ipRangeCheck(address) {
    const octets = address.split('.') // Divide address into octets

    // Go through each tag
    for (let i in ip_ranges) {
        // Go through each IP range
        for (let j in ip_ranges[i]) {
            const range = ip_ranges[i][j].split('.'); // Divide the address into octets
            // console.log(range);
            if (compareOctets(octets, range)) {
                return i;
            }
        }
    }
}

function compareOctets(address, range) {
    for (let i in range) {
        // If the range octet is a * - everything is accepted
        if (range[i] === '*') continue;

        // If the address deviates from the range - it does not belong to it
        if (range[i] !== address[i]) return false;
    }

    // If we get here - the ip is in the range
    return true;
}