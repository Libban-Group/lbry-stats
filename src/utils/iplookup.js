import loadJSON from './loadJSON.js';
import logger from './logger.js';
import db from '../utils/db.js';

db.query("CREATE TABLE IF NOT EXISTS geoip (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, country TEXT, country_code TEXT, continent_code TEXT, region TEXT, city TEXT, timezone TEXT, organization TEXT, created DATE NOT NULL DEFAULT CURRENT_DATE)").run();

// Load known geoip information
const ip_details = loadJSON('/data/ip_details.json') || {};

// Load IP ranges
const ip_ranges = loadJSON('/data/ip_ranges.json') || {};

export default async (ip_list)=>{
    let updated = 0;
    for (const i in ip_list) {

        // Use ip_details if exist
        if (ip_details[ip_list[i].address]) {
            ip_list[i].details = ip_details[ip_list[i].address];
        } else ip_list[i].details = ipRangeCheck(ip_list[i].address); // Use ip_ranges if exist


        // Check cache
        const cache = db.query("SELECT * FROM geoip WHERE ip = ?;").get([ip_list[i].address]);
        if (cache && new Date(cache.created) > new Date().setDate(new Date().getDate() - 7)) { // Use cache if exists and is younger than 7 days
            ip_list[i].geo = {...cache, id: undefined, ip: undefined, created: undefined} // Set .geo to cache and remove id, ip and created
            continue;
        }

        try {
            const geo = await (await fetch(`https://get.geojs.io/v1/ip/geo/${ip_list[i].address}.json`)).json();
            ip_list[i].geo = {
                country: geo.country,
                country_code: geo.country_code,
                continent_code: geo.continent_code,
                region: geo.region,
                city: geo.city,
                timezone: geo.timezone,
                organization: geo.organization_name
            };
    
            // Add to cache
            addCache(geo);

            updated++;
        } catch (err) {
            console.log(err);
        }
    }

    // Log if lookups have been made
    if (updated) {
        logger('info', `Made ${updated} IPLookup${updated > 1 ? 's' : '' }`);
    }

    return ip_list
}

function ipRangeCheck(address) {
    const octets = address.split('.') // Divide address into octets

    // Go through each tag
    for (let i in ip_ranges) {
        // Go through each IP range
        for (let j in ip_ranges[i]) {
            const range = ip_ranges[i][j].split('.'); // Divide the address into octets
            if (compareOctets(octets, range)) return i;
        }
    }
}

function compareOctets(address, range) {
    for (let i in range) {
        // If the range octet is 255 - everything is accepted
        if (range[i] === '255') continue;

        // If the address deviates from the range - it does not belong to it
        if (range[i] !== address[i]) return false;
    }

    // If we get here - the ip is in the range
    return true;
}


function addCache(geo) {
    db.run("INSERT INTO geoip (ip, country, country_code, continent_code, region, city, timezone, organization) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [geo.ip, geo.country, geo.country_code, geo.continent_code, geo.region, geo.city, geo.timezone, geo.organization_name]);
}