window.addEventListener("load", function() { start(); }, true );


var Main = function () { };
Main.prototype = {
    update: function (node, nv) {
        


        node.traverse(nv);
    }
};


var Moving1 = function (path) { this.path = path};
Moving1.prototype = {
    update: function (node, nv) {


        var ratio = 0;
        var currentTime = nv.getFrameStamp().getSimulationTime();
        if (node.startTime === undefined) {
            node.startTime = Math.random() * 2.0;
            if (node.duration === undefined) {
                node.duration = 10.0;
                node.offset = getRandomVector(100);
                node.offset [2] = 0.0
            }
        }

        var dt = currentTime - node.startTime;
        if (dt > node.duration) {
            //node.setNodeMask(0);
            node.startTime = currentTime;
            return;
        }
        
        ratio = dt/node.duration;

        var value = (1.0 - osgAnimation.EaseInQuad(ratio));
        var pos = []; //osg.Vec3.lerp(value, node.start, node.end, []);

        this.path.getValue(dt, pos);

        osg.Vec3.add(pos, node.offset, pos);

        var matrix = [];
        if (node.previousPosition === undefined) {
            node.previousPosition = pos;
            osg.Matrix.makeTranslate(pos[0], pos[1], pos[2], matrix);
        } else {
            var result = [];
            var dir = [];
            osg.Vec3.sub(pos, node.previousPosition, dir);
            osg.Vec3.normalize(dir, dir);
            var up = [0,0,1];
            var s = osg.Vec3.cross(dir, up, []);
            osg.Vec3.normalize(s, s);

            var u = osg.Vec3.cross(s, dir, []);
            osg.Vec3.normalize(u, u);

            result[0]=s[0]; result[1]=u[0]; result[2]=dir[0]; result[3]=0.0;
            result[4]=s[1]; result[5]=u[1]; result[6]=dir[1]; result[7]=0.0;
            result[8]=s[2]; result[9]=u[2]; result[10]=dir[2];result[11]=0.0;
            result[12]=  0; result[13]=  0; result[14]=  0;  result[15]=1.0;

            osg.Matrix.postMult(osg.Matrix.makeTranslate(pos[0], pos[1], pos[2], []),
                                result);
            matrix = result;
        }
        node.setMatrix(matrix);
        node.previousPosition = pos;

        
        node.traverse(nv);
    }
};

var RotateUpdateCallback = function() {};
RotateUpdateCallback.prototype = {
    update: function(node, nv) {
        var ratio = 0;
        var currentTime = nv.getFrameStamp().getSimulationTime();
        if (node.rotate === undefined) {
            
            node.rotate = getRandomVector(1.0);
            osg.Vec3.normalize(node.rotate, node.rotate);
        }
        var m = node.getMatrix();
        osg.Matrix.makeRotate(currentTime * Math.PI/180.0 * 100, node.rotate[0], node.rotate[1], node.rotate[2], m);
        node.traverse(nv);
    }
};

var getRandomVector = function(radius) {
    var r = [Math.random()-0.5, Math.random()- 0.5, Math.random() -0.5];
    return osg.Vec3.mult(r, radius*2.0, r);
};

var getModel2 = function(b) {
    var bezierCB = new Moving1(b);
    var rotate = new RotateUpdateCallback();
    //var child = new osg.createTexturedBox(0,0,25, 50,50,50);
    var child = new osg.createTexturedQuad(-25,0,-25,
                                           50,0,0,
                                           0 , 0, 50);
    var radius = 150.0;
    var transform = new osg.MatrixTransform();

    for (var i = 0, l = 50; i < l; i++) {
        var transform2 = new osg.MatrixTransform();
        var rr = getRandomVector(radius);
        transform2.setMatrix(osg.Matrix.makeTranslate(rr[0],
                                                      rr[1],
                                                      rr[2], []));

        var transformr = new osg.MatrixTransform();
        transformr.setUpdateCallback(rotate);
        transformr.addChild(child);

        transform2.addChild(transformr);
        transform.addChild(transform2);

        transform2.setUpdateCallback(bezierCB);
    }


    //transform.setUpdateCallback(new Moving1(b));
    transform.getOrCreateStateSet().setAttributeAndMode(new osg.CullFace('DISABLE'));
    return transform;
};


var createQuadMotionScene = function(source, target) {
    
    var CB = function() {};
    CB.prototype = {
        update: function(node, nv) {
            var ratio = 0;
            var currentTime = nv.getFrameStamp().getSimulationTime();
            if (node.startTime === undefined) {
                node.startTime = currentTime;
                if (node.duration === undefined) {
                    node.duration = 10.0;
                }
            }

            var dt = currentTime - node.startTime;
            if (dt > node.duration) {
                //node.setNodeMask(0);
                node.startTime = undefined;
                return;
            }
            
            ratio = dt/node.duration;
            
            var value = (1.0 - osgAnimation.EaseInQuad(ratio));
            var pos = osg.Vec3.lerp(value, node.source, node.target, []);

            
            node.setMatrix(osg.Matrix.makeTranslate(pos[0], pos[1], pos[2], []));
            node.traverse(nv);
        }
    };
    
    var q = osg.createTexturedQuad(-0.5,  0, -0.5,
                                   1 ,0 ,0,
                                   0 ,0 ,1);

    var m = new osg.MatrixTransform();
    m.source = source;
    m.target = target;
    m.setUpdateCallback(new CB());
    m.addChild(q);

    return m;
};


var generatePath = function(start, end) {
    var b = new BezierPath();
    var max = 5;
    var radius = 400;
    var step = 2.0;
    var ratioOfDist = 0.3;
    for (var i = 0, l = max; i < l; i++) {
        if (i === 0) {
            b.addKey(0, start);
        } else if (i === l -1) {
            b.addKey(i*step, end);
        } else {
            var p = getRandomVector(radius);
            b.addKey(i*step, p);
        }
    }
    // setup control point
    for (var i = 0, l = max-1; i < l; i++) {
        var d = [];
        if (i !== 0) {
            //assure continuity
            var previous = b.keys[i-1].cout;
            // cin = currentPoint + (currentPoint - previousCout)
            var cin = [];
            osg.Vec3.add(b.keys[i].value, osg.Vec3.sub(b.keys[i].value, previous, cin), cin);
            b.keys[i].cin = cin;

        } else {
            // cin = startPoint + (endPoint - startPoint)
            var cin = [];
            osg.Vec3.sub(b.keys[l].value, b.keys[0].value, cin);
            osg.Vec3.normalize(cin, cin);

            var distNextKey = [];
            osg.Vec3.sub(b.keys[i+1].value, b.keys[i].value, distNextKey);
            var length = osg.Vec3.length(distNextKey);
            osg.Vec3.mult(cin, length * ratioOfDist, cin);
            osg.Vec3.add(b.keys[i].value, cin, cin);

            b.keys[i].cin = cin;
        }

        var cout = [];
        osg.Vec3.sub(b.keys[i+1].value, b.keys[i].value, cout);
        var dist = osg.Vec3.length(cout);
        osg.Vec3.normalize(cout, cout);
        
        osg.Vec3.mult(cout, dist * ratioOfDist, cout);
        b.keys[i].cout = osg.Vec3.sub(b.keys[i+1].value, cout, cout);
    }

    return b;
};

var start = function() {



    var w,h;
    if (window.top == window ) {
        h = document.documentElement.clientHeight;
        w = document.documentElement.clientWidth;
    } else {
        h = window.parent.document.body.clientHeight;
        w = window.parent.document.body.clientWidth;
    }

    var canvas = document.getElementById("3DView");
    canvas.width = w;
    canvas.height = h;
    var viewer = new osgViewer.Viewer(canvas, { antialias: true, 
                                                preserveDrawingBuffer: false } );


    viewer.init();
    viewer.setupManipulator();
//    viewer.view.setClearColor([0.0, 0.0, 0.0, 0.0]);


    var main = new Main();
    var grp = new osg.Node();
    grp.setUpdateCallback(main);

    var b = generatePath([0, -1000,-200], [1000, 1000,200]);
    main.model2 = getModel2(b);
    grp.addChild(main.model2);

    var keys = b.computePath();
    grp.addChild(createModelFromCurve(keys));

    viewer.setScene(grp);
    viewer.getManipulator().computeHomePosition();
    viewer.run();
  
};


