function initializeCameraPath(keys) {
    var createKeyframeVec3 = function(k) {
        var key = [];
        key[0] = k[1];
        key[1] = k[2];
        key[2] = k[3];
        key.time = k[0];
        return key;
    };

    var ks = [];
    var l = keys.length;
    var i;
    ks.duration = keys[l-1][0];

    for ( i = 0; i < l; ++i ) {
        ks.push(createKeyframeVec3(keys[i]));
    }

    ks.last_access = undefined;
    ks.getVec3 = function(t, startIndex) {
        var i;
        var localt;
        var d;
        var key0;
        var key1;
        var t0,t1;
        var l = this.length;
        if (t >= this[l-1].time) {
            return this[l-1];
        }
        if (t < this[0].time) {
            return this[0];
        }

        var start = 0;
        if (startIndex !== undefined) {
            start = startIndex;
        }
        if (start === 0 && this.last_access !== undefined && this[this.last_access].time < t) {
            start = this.last_access;
        }
        for (i = start; i < l; ++i) {
            key0 = this[i];
            key1 = this[i+1];
            t0 = key0.time;
            t1 = key1.time;
            if ( t >= t0 && t < t1) {
                this.last_access = i;
                d = t1 - t0;
                localt = t - t0;
                return osg.Vec3.lerp(localt/d, key0, key1, []);
            }
        }
    };

    return ks;
}
