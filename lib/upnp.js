function formatTime(time) {
    return format(time, [60, 60], "%02d:%02d:%02d");
}

function formatMsDuration(time) {
    return format(time, [60, 60, 1000], "%d:%02d:%02d.%03d");
}

module.exports = {
    formatTime,
    formatMsDuration
};
