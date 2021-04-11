export interface Ribbon {
    id: string;
    name: string;
}

export var SharedRibbons = {
    continueWatching: {
        id: 'continueWatching',
        name: 'Continue Watching'
    } as Ribbon,
    recentlyReleased: {
        id: 'recentlyReleased',
        name: 'Recently Released'
    } as Ribbon
};
