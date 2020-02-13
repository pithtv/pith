import {sprintf} from 'sprintf-js';

function format(n, parts, f) {
    const out = [];
    let nn = n;
    while(parts.length) {
        const p = parts.pop(), pn = nn % p;
        out.unshift(pn);
        nn = (nn - pn) / p;
    }
    out.unshift(nn);
    out.unshift(f);
    return sprintf.apply(null, out);
}

export function formatTime(time) {
    return format(time, [60, 60], "%02d:%02d:%02d");
}

export function formatMsDuration(time) {
    return format(time, [60, 60, 1000], "%d:%02d:%02d.%03d");
}

export function formatDate(time) : string {
    if(time === undefined || time === null) return undefined;
    return sprintf('%04d-%02d-%02d', time.getFullYear(), time.getMonth() + 1, time.getDate());
}
