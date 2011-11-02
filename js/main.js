/** -*- compile-command: "jslint-cli main.js" -*-
 *
 * Copyright (C) 2011 Cedric Pinson
 *
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Authors:
 *  Cedric Pinson <cedric.pinson@plopbyte.com>
 *
 */

window.addEventListener("load", function() { start2(); }, true );
var Viewer;
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
    var youtubeurl = "http://www.youtube.com/watch?v=DHup1JfEsXo";
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

        removeLoading();
        jQuery('#error2').append(msg + '<br>Angle or low gpu can produce it, fix it:<br><br>firefox: go to about:config and set webgl.prefer-native-gl to true.<br>chrome: run chrome with the --use-gl=desktop command-line argument.<br><br>You can watch it on <a href="'+youtubeurl+'">youtube</a>');
        return;
    }

    var cred = window.location.href.indexOf('#credits');
    if (cred >=0) {
        removeLoading();
        showCredits();
        return;
    }

    var audioSound=document.getElementById('zik');
    //audioSound.play();
    //audioSound.volume = 0;


    viewer.init();
    Viewer = viewer;
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


    var MainUpdate = function() { };
    MainUpdate.prototype = {
        update: function(node, nv) {
            node.traverse(nv);
        }
    };

    grp.setUpdateCallback(new MainUpdate());



    viewer.run();
};
