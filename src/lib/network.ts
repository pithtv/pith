import os from 'os';

export function getDefaultServerAddress() {
    const ni = os.networkInterfaces();
    const addresses : {IPv4?: string, IPv6?: string} = {};
    let defaultNi;

    for (let name in ni) {
        if (ni[name][0].internal === false) {
            defaultNi = ni[name];
            break;
        }
    }

    defaultNi.forEach(function (n) {
        addresses[n.family] = n.address;
    });

    return addresses;
}
