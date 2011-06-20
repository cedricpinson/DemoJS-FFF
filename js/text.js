/** -*- compile-command: "jslint-cli text.js" -*- */

var getOrCreateTextShader = function() {
    if (!getOrCreateTextShader.shader) {
        var vertex = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "attribute vec3 Vertex;",
            "attribute vec2 TexCoord0;",
            "uniform mat4 ModelViewMatrix;",
            "uniform mat4 ProjectionMatrix;",
            "varying vec2 uv0;",
            "void main(void) {",
            "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
            "  uv0 = TexCoord0;",
            "}",
            ""
        ].join('\n');

        var fragment = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "varying vec2 uv0;",
            "uniform sampler2D Texture0;",
            "void main(void) {",
            "vec4 color = texture2D(Texture0, uv0);",
            "color[0] *= color.w;",
            "color[1] *= color.w;",
            "color[2] *= color.w;",
            "gl_FragColor = color;",
            "}",
            ""
        ].join('\n');

        var program = new osg.Program(
            new osg.Shader(gl.VERTEX_SHADER, vertex),
            new osg.Shader(gl.FRAGMENT_SHADER, fragment));

        getOrCreateTextShader.shader = program;
    }

    return getOrCreateTextShader.shader;
};

var createTextBlur = function (text, position, color) {

    var setShadow = function(ctx, color, ox, oy, blur) {
        ctx.shadowColor = color;
        ctx.shadowOffsetX = ox;
        ctx.shadowOffsetY = oy;
        ctx.shadowBlur = blur;
    };

    if (!position) {
        position = [ 0, 0, 0];
    }

    if (!color) {
        color = "rgba( 0, 0, 0, 1.0)";
    }
    var w,h;
    w = 1024;
    h = 256;

    var canvas = document.createElement('canvas');
    document.getElementById('View').appendChild(canvas);
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);


    var ctx		= canvas.getContext('2d');
    //ctx.globalAlpha = 0.1;
    //ctx.globalAlpha   = 0.5;
    ctx.fillStyle	= color;
    //ctx.fillStyle	= "rgba(0,0,0,0.0)";
    ctx.font = h + "px sans-serif";
    setShadow(ctx, color, 0,0,20);
    ctx.fillText(text, 0 , h-20);
    //ctx.strokeText(text, 0 , h-20);
    //ctx.shadowOffsetX = 40;
    //ctx.shadowOffsetY = -40;
    //ctx.shadowColor = "rgb(255,0,0)";
    //ctx.shadowBlur = 2000;
    var size = ctx.measureText(text).width;
    var ratio = h/w;
    var stop = size/w;
    osg.log(" size " + size + " quad " + stop);
    var quad = osg.createTexturedQuad(position[0], position[1], position[2],
                                      stop,  0, 0,
                                      0,  0, ratio);
    //quad.getOrCreateStateSet().setAttributeAndMode(getOrCreateTextShader());
    var uvs = quad.getAttributes().TexCoord0
    for (var i = 0, l = uvs.getElements().length/2; i < l; i++) {
        uvs.getElements()[i*2] *= stop;
    }
    delete quad.getAttributes().Normal;
    uvs.dirty();

    quad.size = size/w;
    quad.height = ratio;
    var texture = osg.Texture.createFromCanvas(canvas);
    texture.setMinFilter("LINEAR_MIPMAP_LINEAR");
    quad.getOrCreateStateSet().setTextureAttributeAndMode(0, texture);
    return quad;
};


var createText = function (text, position, color) {
    if (!position) {
        position = [ 0, 0, 0];
    }

    if (!color) {
        color = "rgba( 0, 0, 0, 1.0)";
    }
    var w,h;
    w = 1024;
    h = 256;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);


    var ctx		= canvas.getContext('2d');
    ctx.fillStyle	= color;
    ctx.font = h + "px sans-serif";
    ctx.fillText(text, 0 , h-20);
    var size = ctx.measureText(text).width;
    var ratio = h/w;
    var stop = size/w;
    osg.log(" size " + size + " quad " + stop);
    var quad = osg.createTexturedQuad(position[0], position[1], position[2],
                                      stop,  0, 0,
                                      0,  0, ratio);
    //quad.getOrCreateStateSet().setAttributeAndMode(getOrCreateTextShader());
    var uvs = quad.getAttributes().TexCoord0
    for (var i = 0, l = uvs.getElements().length/2; i < l; i++) {
        uvs.getElements()[i*2] *= stop;
    }
    delete quad.getAttributes().Normal;
    uvs.dirty();

    quad.size = size/w;
    quad.height = ratio;
    var texture = osg.Texture.createFromCanvas(canvas);
    texture.setMinFilter("LINEAR_MIPMAP_LINEAR");
    quad.getOrCreateStateSet().setTextureAttributeAndMode(0, texture);
    return quad;
};

var createTransfrom = function (quad) {
    var tr = new osg.MatrixTransform();
    var rotate = osg.Matrix.makeRotate(Math.PI/2 * 0, 0, 1, 0);
    var translate = osg.Matrix.makeTranslate(quad.size , 0, 0);
    tr.setMatrix(osg.Matrix.preMult(translate,rotate));
    tr.size = quad.size;
    return tr;
};


var getSubPartAnimation = function() {

    
};

var createFullText = function() {
    var subpartAnimation  = new Rotate();
    var matrixAnimation = [];
    var grp = new osg.Node();
    var flat = function() {

        var q0 = createText("Demo");
        grp.addChild(q0);
        var color = "rgba(255,104,1,1.0)";

        var q1 = createText("JS", [0,0,0], color);
        var rotate = new osg.MatrixTransform();
        var tr = createTransfrom(q0);
        rotate.addChild(q1);
        rotate.setUpdateCallback(subpartAnimation);

        var startRotation = 0;
        var endRotation = -Math.PI/2;
        osg.Matrix.makeRotate(startRotation, 0,1,0, matrixAnimation);
        rotate.setMatrix(matrixAnimation);
        rotate.start = [startRotation, 0, 1,0];
        rotate.end = [endRotation, 0, 1, 0];
        rotate.startTime = 2.90;
        rotate.duration = 0.45;
        

        tr.addChild(rotate);
        grp.addChild(tr);
    };
    
    
    var blur = function() {
        var offset = new osg.MatrixTransform();
        var q0 = createTextBlur("Demo");
        offset.addChild(q0);
        var color = "rgba(255,104,1,1.0)";

        var q1 = createTextBlur("JS", [0,0,0], color);
        var tr = createTransfrom(q0);


        tr.addChild(q1);
        offset.addChild(tr);
        offset.setMatrix(osg.Matrix.makeTranslate(0,0.05,0));

        grp.addChild(offset);
    };

    //blur();
    flat();
    return grp;
};


var Move = function () { this.result = [];};
Move.prototype = {
    update: function (node, nv) {

        var ratio = 0;
        var currentTime = nv.getFrameStamp().getSimulationTime();
        if (node.startTime === undefined) {
            node.startTime = currentTime;
            if (node.duration === undefined) {
                node.duration = 2.0;
            }
        }

        var dt = currentTime - node.startTime;
        if (dt > node.duration || dt < 0) {
            node.traverse(nv);
            //node.setNodeMask(0);
            //node.startTime = currentTime;
            return;
        }
        
        ratio = dt/node.duration;
        var value = osgAnimation.EaseOutQuad(ratio);
        osg.Vec3.lerp(value, node.start, node.end, this.result);
        osg.Matrix.makeTranslate(this.result[0], this.result[1], this.result[2], node.getMatrix());
        node.traverse(nv);
    }
};


var Rotate = function () { this.result = []};
Rotate.prototype = {
    update: function (node, nv) {

        var ratio = 0;
        var currentTime = nv.getFrameStamp().getSimulationTime();
        if (node.startTime === undefined) {
            node.startTime = currentTime;
            if (node.duration === undefined) {
                node.duration = 2.0;
            }
        }
        var dt = currentTime - node.startTime;
        if (dt > node.duration || dt < 0) {
            node.traverse(nv);
            //node.setNodeMask(0);
            //node.startTime = currentTime;
            return;
        }
        
        ratio = dt/node.duration;
        var value = osgAnimation.EaseOutQuad(ratio);
        osg.Vec4.lerp(value, node.start, node.end, this.result);
        osg.Matrix.makeRotate(this.result[0], this.result[1], this.result[2], this.result[3], node.getMatrix());
        node.traverse(nv);
    }
};


var createSceneText = function() {

    var grp = new osg.MatrixTransform();
    grp.getOrCreateStateSet().setAttributeAndMode(new osg.CullFace('DISABLE'));
    grp.getOrCreateStateSet().setAttributeAndMode(getOrCreateTextShader(), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);
    grp.getOrCreateStateSet().setAttributeAndMode(new osg.BlendFunc('ONE', 'ONE_MINUS_SRC_ALPHA'));


    grp.addChild(createFullText());
    grp.setUpdateCallback(new Move());
    grp.setNodeMask(0);
    grp.startTime = 1.60;
    grp.start = [10, 0,0];
    grp.end = [0, 0, 0];
    grp.duration = 0.45;
    setTimeout(function() {
        grp.setNodeMask(1);
    }, 1550);

    var mtr = new osg.MatrixTransform();
    mtr.setUpdateCallback(new Rotate());
    var startRotation = Math.PI + Math.PI/2 + Math.PI/4;
    var endRotation = Math.PI + Math.PI/2 + Math.PI/2;
    osg.Matrix.makeRotate(startRotation, 0,0,1, mtr.getMatrix());
    mtr.start = [startRotation, 0, 0,1];
    mtr.end = [endRotation, 0, 0, 1];
    mtr.startTime = 2.90;
    mtr.duration = 0.45;

    mtr.addChild(grp);
    return mtr;


    var q0 = createText("Demo");
    grp.addChild(q0);
    var color = "rgba(255,104,1,1.0)";

    var q1 = createText("JS", [0,0,0], color);
    var tr = createTransfrom(q0);
    tr.addChild(q1);
    grp.addChild(tr);


    var q0 = createTextBlur("Demo");
    grp.addChild(q0);
    var color = "rgba(255,104,1,1.0)";

    var q1 = createTextBlur("JS", [0,0,0], color);
    var tr = createTransfrom(q0);
    tr.addChild(q1);
    grp.addChild(tr);
    

    return grp;
}
