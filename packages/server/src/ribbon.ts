import { Ribbon, RibbonItem } from "@pithmediaserver/api"

export var SharedRibbons = {
    continueWatching: {
        id: 'continueWatching',
        name: 'Continue Watching'
    } as Ribbon,
    recentlyReleased: {
        id: 'recentlyReleased',
        name: 'Recently Released'
    } as Ribbon,
    recentlyAdded: {
        id: 'recentlyAdded',
        name: 'Recently Added'
    } as Ribbon
};

export var RibbonOrder : {[key: string]: (a: RibbonItem, b: RibbonItem) => number} = {
    recentlyReleased: (a,b) => b.item.releaseDate.getTime() - a.item.releaseDate.getTime(),
    recentlyAdded: (a,b) => b.item.dateScanned.getTime() - a.item.dateScanned.getTime(),
    continueWatching: (a,b) => b.item.playState?.time - a.item.playState?.time
}
