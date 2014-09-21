(function() {
    "use strict";
    
    var minColumnWidth = 120, containerpadding = 20, itempadding=8, nc;
    
    for(nc = 1; nc < 20; nc++) {
        var maxScreenWidth = (nc + 1) * minColumnWidth - 1,
            minScreenWidth = nc * minColumnWidth,
            v = {},
            query = '@media (max-width: ' + maxScreenWidth + 'px) and (min-width: ' + minScreenWidth + 'px)';
        
        v[query] = ['.contentbrowser.poster .contentitem'];
        
        vein.inject([v], {'width': 'calc((100% - ' + (containerpadding + itempadding * nc) + 'px) / ' + nc + ')'});
    }
    
})();