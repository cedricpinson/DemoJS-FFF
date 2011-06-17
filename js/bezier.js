// dont know bezier look here http://devmag.org.za/2011/04/05/bzier-curves-a-tutorial/


var BezierPath = function() {
    this.keys = [];
};

BezierPath.prototype = {
    getKeyIndexFromTime: function(keys, t) {
        var size = keys.length;
        if (size === 0) {
            osg.log("getKeyIndexFromTime the container is empty, impossible to get key index from time");
            return -1;
        }
        
        for (var i = 0, l = size-1; i < l; i++) {
            var t0 = keys[i].t;
            var t1 = keys[i+1].t;
            if ( t >= t0 && t < t1 ) 
            {
                this.lastKeyAccess = i;
                return i;
            }
        }
    },

    calculateBezierPoint: function (t, p0, p1, p2, p3, result) {
        var u = 1-t;
        var tt = t*t;
        var uu = u*u;
        var uuu = uu * u;
        var ttt = tt * t;
        
        var p_0 = osg.Vec3.mult(p0, uuu, []); //first term
        var p_1 = osg.Vec3.mult(p1, 3 * uu * t, []); //second term
        var p_2 = osg.Vec3.mult(p2, 3 * u * tt, []); //third term
        var p_3 = osg.Vec3.mult(p3, ttt, []); //fourth term
        
        result[0] = p_0[0] + p_1[0] + p_2[0] + p_3[0];
        result[1] = p_0[1] + p_1[1] + p_2[1] + p_3[1];
        result[2] = p_0[2] + p_1[2] + p_2[2] + p_3[2];
        return result;
    },

    getValue: function(t, result) {
        return this._getValue(this.keys, t, result);
    },
    _getValue: function(keys, t, result) {

        if (t >= keys[keys.length-1].t) {
            osg.Vec3.copy(keys[keys.length-1].value, result);
            return;
        } else if (t <= keys[0].t) {
            osg.Vec3.copy(keys[0].value, result);
            return;
        }

        var i = this.getKeyIndexFromTime(keys, t);
        var t0 = keys[i].t;
        var t1 = keys[i+1].t;
        var tf = (t - t0) / ( t1 - t0);

        return this.calculateBezierPoint(tf, keys[i].value, keys[i].cin, keys[i].cout, keys[i+1].value, result);
    },

    addKey: function(t, p0, p1, p2) {
        this.keys.push({ t: t, 
                         cin: p1,
                         value: p0,
                         cout: p2});
    },


    computePath: function() {
        var points = [];

        for (var i = 0, l = this.keys.length-1; i < l; i++) {
            var p0 = this.keys[i].value;
            var p1 = this.keys[i].cin;
            var p2 = this.keys[i].cout;
            var p3 = this.keys[i+1].value;
            
            if(i == 0) //Only do this for the first endpoint.
                //When i != 0, this coincides with the end
                //point of the previous segment
            {
                points.push(this.calculateBezierPoint(0, p0, p1, p2, p3, []));
            }    
            
            var SEGMENTS_PER_CURVE = 10;
            for(var j = 1; j <= SEGMENTS_PER_CURVE; j++)
            {
                var t = j / SEGMENTS_PER_CURVE;
                points.push(this.calculateBezierPoint(t, p0, p1, p2, p3, []));
            }
        }
        return points;
    }
};


var createModelFromCurve = function(keysPosition, color) {
    var g = new osg.Geometry();

    if (color === undefined) {
        color = [1.0, 1.0, 1.0, 0.7 ];
    }

    var colors = [];
    var vertexes = [];
    for (var i = 0, l = keysPosition.length; i < l; i++) {
        vertexes.push(keysPosition[i][0], keysPosition[i][1], keysPosition[i][2]);
    }
    for (var i = 0, l = vertexes.length/3; i < l; i++) {
        colors.push(color[0], color[1], color[2], color[3]);
    }
    osg.log(vertexes);

    g.getAttributes().Vertex = osg.BufferArray.create(gl.ARRAY_BUFFER, vertexes, 3 );
    g.getAttributes().Color = osg.BufferArray.create(gl.ARRAY_BUFFER, colors, 4 );
    var primitive = new osg.DrawArray(gl.LINE_STRIP, 0, vertexes.length/3);
    g.getPrimitives().push(primitive);
    return g;
};