window.addEventListener("load", function() { start(); }, true );

function getShader()
{
    var vertexshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "attribute vec3 Vertex;",
        "uniform mat4 ModelViewMatrix;",
        "uniform mat4 ProjectionMatrix;",
        "uniform vec4 fragColor;",
        "varying vec4 position;",
        "void main(void) {",
        "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
        "  position = ModelViewMatrix * vec4(Vertex,1.0);",
        "}"
    ].join('\n');

    var fragmentshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "uniform vec4 fragColor;",
        "varying vec4 position;",
        "void main(void) {",
        "  float d = 0.05;",
        "  float f = gl_FragCoord.z/gl_FragCoord.w;",
        "  f = clamp(exp2(-d*d * f*f * 1.44), 0.0, 1.0);",
        "  gl_FragColor = vec4(f, f, f, f);",
        "}",
        ""
    ].join('\n');

    var program = new osg.Program(
        new osg.Shader(gl.VERTEX_SHADER, vertexshader),
        new osg.Shader(gl.FRAGMENT_SHADER, fragmentshader));

    return program;
}


var material = new osg.Material();

var UpdateCallback = function() {};
UpdateCallback.prototype = {
    // this update callback will be called for the affected node ( see below )
    update:function(node, nv) {
        var t = nv.getFrameStamp().getSimulationTime();
        var m = node.getMatrix();
        var r = osgAnimation.EaseOutElastic(t%1.0);

        // scale the currend node
        osg.Matrix.makeScale(1,1,1 + r, m);

        //change the material
        var r2 = osgAnimation.EaseOutElastic(t*0.1%1.0);
        material.setDiffuse([r2,0,r2,r]);
    }
};

function start(){
    var canvas = document.getElementById("3DView");
    var w,h;
    if (window.top == window ) {
        h = document.documentElement.clientHeight;
        w = document.documentElement.clientWidth;
    } else {
        h = window.parent.document.body.clientHeight;
        w = window.parent.document.body.clientWidth;
    }
    canvas.width = w;
    canvas.height = h;
    var viewer = new osgViewer.Viewer(canvas);
    viewer.init();
    viewer.view.setClearColor([1.0, 0.0, 0.0, 0.0]);

    var root = new osg.Node();
    viewer.setScene(root);


    var box = osg.createTexturedBox(0, 0, 0,
                                    10, 10 , 10);
    // add one box under root node
    root.addChild(box);

    // create group node that will contain stuff
    var group = new osg.MatrixTransform();
    root.addChild(group);
    var box2 = osg.createTexturedBox(0, 0, 0,
                                     10, 10 , 10);
    
    var scale = new osg.MatrixTransform();
    // assing an update callback to this node
    scale.setUpdateCallback(new UpdateCallback());
    // add box2 under scale
    scale.addChild(box2);

    // add scale transform under group node
    group.addChild(scale);
    group.setMatrix(osg.Matrix.makeTranslate(15, 0 ,0 , []));

    // change material of box2
    material.setDiffuse([1,0,1,1]);
    box2.getOrCreateStateSet().setAttributeAndMode(material);

    // add a shader on group node ( it will affect subchild ) 
    group.getOrCreateStateSet().setAttributeAndMode(getShader());

    // enable blending
    group.getOrCreateStateSet().setAttributeAndMode(new osg.BlendFunc('ONE', 'ONE_MINUS_SRC_ALPHA'));


    viewer.setupManipulator();
    viewer.run();
}