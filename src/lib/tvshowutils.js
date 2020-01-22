module.exports = {
    aggregatePlayState(items) {
        const aggr = items.reduce(function (state, ep) {
            if (!ep.playable && !ep.playState) {
                return state;
            } else {
                switch (ep.playState && ep.playState.status) {
                    case 'inprogress':
                        return state | 1;
                    case 'watched':
                        return state | 2;
                    default:
                        return state | 4;
                }
            }
        }, 0);
        let playstate;
        switch (aggr) {
            case 0:
                playstate = null;
                break; // none watched, inprogress, or unwatched... so basically no episodes whatsoever
            case 1:
                playstate = 'inprogress';
                break; // all in progress
            case 2:
                playstate = 'watched';
                break; // all watched
            case 3:
                playstate = 'inprogress';
                break; // some watched, some in progress
            case 4:
                playstate = null;
                break; // all unwatched
            default:
                playstate = 'inprogress'; // some unwatched
        }
        return {
            status: playstate
        };
    }
};
