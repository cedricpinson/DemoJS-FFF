window.addEventListener("load", function() { start2(); }, true );

var start2 = function() {

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

    var grp = new osg.Node();
    grp.addChild(initParticles());
    viewer.view.setClearColor([0.3, 0.3, 0.3, 1.0]);
    viewer.setScene(grp);
    viewer.getManipulator().computeHomePosition();
    viewer.run();
  
};


