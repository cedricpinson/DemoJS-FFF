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
                                                preserveDrawingBuffer: false, 
                                                alpha: true  } );

    viewer.init();
    viewer.setupManipulator();

    var grp = new osg.Node();
    grp.addChild(initParticles());
    viewer.view.setClearColor([0.0, 0.0, 0.0, 0.0]);

    viewer.view.setComputeNearFar(false);
    var ratio = w / h;
    viewer.view.setProjectionMatrix(osg.Matrix.makePerspective(60, ratio, 0.1, 100.0));

    viewer.setScene(grp);

    //grp.addChild(createSceneText());
    viewer.getManipulator().computeHomePosition();
  
    var audioSound=document.getElementById('zik');

    var startMusic = 1.0;
    var MainUpdate = function() { this.previousAudioTime = 0.0;};
    MainUpdate.prototype = {
        update: function(node, nv) {
            var t = audioSound.currentTime;
            var dtAudio = t - this.previousAudioTime;
            this.previousAudioTime = t;

            Timeline.getGlobalInstance().update(dtAudio);

            node.traverse(nv);
        }
    };

    setTimeout(function() {
        audioSound.play();
    }, Math.floor(startMusic * 1000));

    grp.setUpdateCallback(new MainUpdate());



    viewer.run();
};
