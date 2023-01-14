import loadJSON from './loadJSON.js';
import saveJSON from './saveJSON.js';
import logger from './logger.js';

// Load known geoip information
const known_geoip = loadJSON('/data/known_geoip.json') || {};

// Load cached geoip information
let cache_geoip = loadJSON('/data/cache_geoip.json', true) || {};

export default async (ip_list)=>{
    let updated;
    
    for (const i in ip_list) {

        // Use known_geoip if exist
        if (known_geoip[ip_list[i].address]) {
            ip_list[i].geo = known_geoip[ip_list[i].address];
            continue;
        }

        // Use cache_geoip if exist and valid
        if (cache_geoip[ip_list[i].address] && new Date(cache_geoip[ip_list[i].address].expire) > Date.now()) {
            ip_list[i].geo = cache_geoip[ip_list[i].address];
            continue;
        }

        logger('info', `IPLookup: ${ip_list[i].address}`);

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

            // Add to cache_geoip
            cache_geoip[ip_list[i].address] = ip_list[i].geo;

            // Update the known_geoip.json file
            updated = true;
        } catch (err) {
            console.log(err);
        }
    }
    
    // Update cache_geoip.json
    if (updated) saveJSON('/data/cache_geoip.json', cache_geoip);
    return ip_list;
}