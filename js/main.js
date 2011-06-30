window.addEventListener("load", function() { start2(); }, true );

var start2 = function() {
    var webglBrowser = '' +
        'This page requires a browser that supports WebGL.<br/>' +
        '<a href="http://get.webgl.org">Click here to upgrade your browser</a>';

    var otherProblem = '' +
        "It doesn't appear your computer can support WebGL.<br/>" +
        '<a href="http://get.webgl.org">Click here for more information</a>';

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
    var youtubeurl = "youtube";
    var webglerror = function (msg) {
        var str = window.WebGLRenderingContext ?
            webglBrowser :
            otherProblem;

        jQuery('#error').append(str + ' or you can still watch it on <a href="'+youtubeurl+'">youtube</a>');
        removeLoading();
    };
    var viewer = new osgViewer.Viewer(canvas, { antialias: true, 
                                                preserveDrawingBuffer: false, 
                                                alpha: true  }, webglerror );
    

    var numTexturesAvailableInVertexShader = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    osg.log("Nb Texture Unit in vertex shader " + numTexturesAvailableInVertexShader);
    if (numTexturesAvailableInVertexShader < 9) {
        var msg = "Requires 9 texture unit on vertex shader (" + numTexturesAvailableInVertexShader+ ")";
        osg.log(msg);
        //jQuery('#loading').append('<div id="erreur"> ' + </div>');

        jQuery('#error2').append(msg + '<br>Angle or low gpu can produce it, fix it:<br><br>firefox: go to about:config and set webgl.prefer-native-gl to true.<br>chrome: run chrome with the --use-gl=desktop command-line argument.<br><br>You can watch it on <a href="'+youtubeurl+'">youtube</a>');
        removeLoading();
        return;
    }

    var audioSound=document.getElementById('zik');


    viewer.init();
    viewer.setupManipulator();

    var keys = initializeCameraPath(cameraPath);
    var target = initializeCameraPath(targetPath);

    //var cameraTarget = [ 0.7 , 0.7, 0.5 ];
    setEqualizerCameraPosition = function() {
        var t = this.timeStart;
        viewer.getManipulator().getInverseMatrix = function() {
            var position = keys.getVec3(audioSound.currentTime - t);
            var cameraTarget = target.getVec3(audioSound.currentTime - t);
            return osg.Matrix.makeLookAt(position,
                                         cameraTarget,
                                         [0,0,1], 
                                         []);
        };
    };


    var grp = new osg.Node();
    viewer.view.setClearColor([0.0, 0.0, 0.0, 0.0]);

    viewer.view.setComputeNearFar(false);
    var ratio = w / h;
    viewer.view.setProjectionMatrix(osg.Matrix.makePerspective(60.0, ratio, 0.1, 100.0));

    grp.addChild(initParticles());
    viewer.setScene(grp);

    //grp.addChild(createSceneText());
    viewer.getManipulator().computeHomePosition();

  

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

    grp.setUpdateCallback(new MainUpdate());



    viewer.run();
};
