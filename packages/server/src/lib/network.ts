import os from 'os';

export function getDefaultServerAddress() {
    const ni = os.networkInterfaces();
    const addresses : {IPv4?: string, IPv6?: string} = {};
    let defaultNi;

    for (let name in ni) {
        let iface = ni[name];
        if (iface[0].internal === false && iface.find(i => i.family==="IPv4")) {
            defaultNi = iface;
            break;
        }
    }

    defaultNi.forEach(function (n) {
        addresses[n.family] = n.address;
    });

    return addresses;
}
