import loadJSON from "./loadJSON.js";
import saveJSON from "./saveJSON.js";

export default async (ip_list)=>{
    const geoip = loadJSON('/data/known_geoip.json') || {};
    for (const i in ip_list) {
        if (geoip[ip_list[i].address]) {
            ip_list[i].geo = geoip[ip_list[i].address];
        } else {
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
                };
                geoip[ip_list[i].address] = ip_list[i].geo;
            } catch {
                
            }
        }
    }

    // saveJSON('/data/geoip.json', geoip);

    return ip_list;
}