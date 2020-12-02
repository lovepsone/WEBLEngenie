var now;

(function(w) {

    let perfNow;
    let perfNowNames = ['now', 'webkitNow', 'msNow', 'mozNow'];

    if(!!w['performance']) {
    
        for(let i = 0; i < perfNowNames.length; ++i) {

            let n = perfNowNames[i];

            if(!!w['performance'][n]) {

                perfNow = function() {
                    return w['performance'][n]()
                };
                break;
            }
        }
    }
    
    if(!perfNow) perfNow = Date.now;
    now = perfNow;
})(window);