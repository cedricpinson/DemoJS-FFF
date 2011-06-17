/** -*- compile-command: "jslint-cli particles.js" -*- */
var initParticles = function() {

    var root = new osg.Node();
    root.setNodeMask(0);
    var textureSize = [512, 512];

    var createParticlesShader = function() {
        var vertex = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "attribute vec3 Vertex;",
            "attribute vec2 TexCoord0;",
            "uniform mat4 ProjectionMatrix;",
            "varying vec2 FragTexCoord0;",
            "void main(void) {",
            "  gl_Position = ProjectionMatrix * vec4(Vertex, 1.0);",
            "  FragTexCoord0 = TexCoord0;",
            "}",
            ""
        ].join('\n');

        var fragment = [
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "uniform float time;",
            "uniform float deltaTime;",
            "varying vec2 FragTexCoord0;",
            "uniform int bits;",
            "uniform sampler2D PreviousPosX;",
            "uniform sampler2D PreviousPosY;",
            "uniform sampler2D PreviousPosZ;",
            "uniform sampler2D PosX;",
            "uniform sampler2D PosY;",
            "uniform sampler2D PosZ;",
            "float unpack(vec4 vec) {",
            "  return vec[0] * 255.0 / 256.0 + vec[1] * 255.0 / (256.0 * 256.0) + vec[2] * 255.0 / (256.0 * 256.0 * 256.0);",
            "}",
            "vec4 pack(float value) {",
            "  return vec4(floor(value * 256.0)/255.0, floor(fract(value * 256.0) * 256.0)/255.0 , floor(fract(value * 65536.0) * 256.0)/255.0, 0.0);",
            "}",
            "vec3 getPreviousPosition() {",
            "   vec4 p0 = texture2D( PreviousPosX, vec2(FragTexCoord0.x, FragTexCoord0.y));",
            "   vec4 p1 = texture2D( PreviousPosY, vec2(FragTexCoord0.x, FragTexCoord0.y));",
            "   vec4 p2 = texture2D( PreviousPosZ, vec2(FragTexCoord0.x, FragTexCoord0.y));",
            "   return vec3(unpack(p0), unpack(p1), unpack(p2));",
            "}",
            "vec3 getCurrentPosition() {",
            "   vec4 p0 = texture2D( PosX, vec2(FragTexCoord0.x, FragTexCoord0.y));",
            "   vec4 p1 = texture2D( PosY, vec2(FragTexCoord0.x, FragTexCoord0.y));",
            "   vec4 p2 = texture2D( PosZ, vec2(FragTexCoord0.x, FragTexCoord0.y));",
            "   return vec3(unpack(p0), unpack(p1), unpack(p2));",
            "}",
            "",
            "void main(void) {",
            "   vec3 previousPos = getPreviousPosition();",
            "   vec3 currentPos = getCurrentPosition();",
            "   vec4 x = pack(previousPos[0]);",
            "   vec4 y = pack(previousPos[1]);",
            "   vec4 z = pack(previousPos[2]);",
            "   if (bits == 0) {",
            "      gl_FragColor = x;",
            "   } else if (bits == 1) {",
            "      gl_FragColor = y;",
            "   } else {",
            "      gl_FragColor = z;",
            "   }",
            "}",
            ""
        ].join('\n');

        var program = new osg.Program(
            osg.Shader.create(gl.VERTEX_SHADER, vertex),
            osg.Shader.create(gl.FRAGMENT_SHADER, fragment));
        return program;
    };

    var ready = function() {
        osg.log("ready");
        root.setNodeMask(~0x0);
    };
    var createTexture = function(size) {
        
        var img = new Image();
        img.onload = ready;
        img.src = 'texture.png';
        var texture = new osg.Texture();
        texture.setImage(img);
        texture.setTextureSize(textureSize[0], textureSize[1]);
        texture.setMinFilter('NEAREST');
        texture.setMagFilter('NEAREST');
        return texture;
    };

    var Physics = function(camerax, cameray, cameraz) {
        this.camera = [ camerax, cameray, cameraz ];
        
        this.buffers = [
            [ createTexture(), createTexture(), createTexture()],
            [ createTexture(), createTexture(), createTexture()],
            [ createTexture(), createTexture(), createTexture()]
        ];

        var node = new osg.Node();
        node.addChild(camerax);
        node.addChild(cameray);
        node.addChild(cameraz);
        this.root = node;
    };
    Physics.prototype = {
        switchBuffer: function() {
            var prev = this.buffers[0];
            var cur = this.buffers[1];
            var next = this.buffers[2];
            
            this.buffers[0] = next;
            this.buffers[1] = prev;
            this.buffers[2] = cur;

            for ( var i = 0, l = 3; i < l; i++) {
                this.camera[i].statesetGeometry.setTextureAttributeAndMode(0, this.buffers[0][0]);
                this.camera[i].statesetGeometry.setTextureAttributeAndMode(1, this.buffers[0][1]);
                this.camera[i].statesetGeometry.setTextureAttributeAndMode(2, this.buffers[0][2]);

                this.camera[i].statesetGeometry.setTextureAttributeAndMode(3, this.buffers[1][0]);
                this.camera[i].statesetGeometry.setTextureAttributeAndMode(4, this.buffers[1][1]);
                this.camera[i].statesetGeometry.setTextureAttributeAndMode(5, this.buffers[1][2]);
                this.camera[i].attachTexture(gl.COLOR_ATTACHMENT0, this.buffers[2][i]);
            }
        },
        getDisplayTexture: function() {
            return this.buffers[2];
        }
    };

    var createPhysics = function() {

        var previousPosX = osg.Uniform.createInt1(0,'PreviousPosX');
        var previousPosY = osg.Uniform.createInt1(1,'PreviousPosX');
        var previousPosZ = osg.Uniform.createInt1(2,'PreviousPosX');

        var currentPosX = osg.Uniform.createInt1(3,'CurrentPosX');
        var currentPosY = osg.Uniform.createInt1(4,'CurrentPosX');
        var currentPosZ = osg.Uniform.createInt1(5,'CurrentPosX');

        var createCamera = function(bits) {
            var camera = new osg.Camera();
            camera.setRenderOrder(osg.Camera.PRE_RENDER, 0);
            camera.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
            camera.setViewport(new osg.Viewport(0,0,textureSize[0],textureSize[1]));
            camera.setClearColor([0, 0, 0, 0]);
            camera.setProjectionMatrixAsOrtho(0, 1, 0, 1, -1, 1);

            var quad = osg.createTexturedQuad(0, 0, 0,
                                              1,  0, 0,
                                              0,  1, 0);
            camera.addChild(quad);

            var prg = createParticlesShader();
            var stateset = quad.getOrCreateStateSet();

            stateset.setAttributeAndMode(prg);
            stateset.addUniform(osg.Uniform.createInt1(bits,'bits'));

            stateset.addUniform(previousPosX);
            stateset.addUniform(previousPosY);
            stateset.addUniform(previousPosZ);
            stateset.addUniform(currentPosX);
            stateset.addUniform(currentPosY);
            stateset.addUniform(currentPosZ);
            camera.statesetGeometry = stateset;

            return camera;
        };

        var x = createCamera(0);
        var y = createCamera(1);
        var z = createCamera(2);
        return new Physics(x, y, z);
    };
    

    var Render = function(node, stateset) {
        this.stateSet = stateset;
        this.root = node;
    };
    Render.prototype = {
        setDisplayTexture: function(textureArray) {
            this.stateSet.setTextureAttributeAndMode(0, textureArray[0]);
            this.stateSet.setTextureAttributeAndMode(1, textureArray[1]);
            this.stateSet.setTextureAttributeAndMode(2, textureArray[2]);
        }
    };

    var createRender = function() {
        var node = new osg.Node();
        var geom = new osg.Geometry();
        var elements = [];
        var y = 0;
        var sizex = textureSize[0];
        var sizey = textureSize[1];
        var i;
        for (i = 0; i < sizex; i++) {
            for (var j = 0; j < sizey; j++) {
                elements.push(i/sizex, j/sizey, 0);
            }
        }

        geom.getAttributes().Vertex = new osg.BufferArray(gl.ARRAY_BUFFER, elements, 3 );
        geom.getPrimitives().push(new osg.DrawArrays(gl.POINTS,0,elements.length/3));
        node.addChild(geom);

        var vertex = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "attribute vec3 Vertex;",
            "uniform mat4 ModelViewMatrix;",
            "uniform mat4 ProjectionMatrix;",
            "uniform sampler2D X;",
            "uniform sampler2D Y;",
            "uniform sampler2D Z;",
            "varying vec4 color;",

            "float unpack(vec4 vec) {",
            "  return vec[0] * 255.0 / 256.0 + vec[1] * 255.0 / (256.0 * 256.0) + vec[2] * 255.0 / (256.0 * 256.0 * 256.0);",
            "}",
            "void main(void) {",
            "  vec2 uv = vec2(Vertex.x, Vertex.y);",
            "  float x = unpack(texture2D( X, uv));",
            "  float y = unpack(texture2D( Y, uv));",
            "  float z = unpack(texture2D( Z, uv));",
            "  vec4 p = vec4(x,y,z,0);",
            "  vec4 v;",
            "  v[0] = (p[0] - 0.5) * 1.0;",
            "  v[1] = (p[1] - 0.5) * 1.0;",
            "  v[2] = (p[2] - 0.5) * 1.0;",
            "  v[3] = 1.0;",
            "  //v[0] = x;",
            "  //v[1] = y;",
            "  color = vec4(uv.x, uv.y, 0.0, 1.0);",
            "  gl_Position = ProjectionMatrix * ModelViewMatrix * v;",
            "  gl_PointSize = 10.0;",
            "}",
            ""
        ].join('\n');

        var fragment = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "varying vec4 color;",
            "void main(void) {",
            "gl_FragColor = color;",
            "}",
            ""
        ].join('\n');

        var program = new osg.Program(
            new osg.Shader(gl.VERTEX_SHADER, vertex),
            new osg.Shader(gl.FRAGMENT_SHADER, fragment));
        
        var stateset = geom.getOrCreateStateSet();
        stateset.setAttributeAndMode(program);

        stateset.addUniform(osg.Uniform.createInt1(0,"X"));
        stateset.addUniform(osg.Uniform.createInt1(1,"Y"));
        stateset.addUniform(osg.Uniform.createInt1(2,"Z"));

        return new Render(node, stateset);
    };

    var physics = createPhysics();
    var render = createRender();


    var UpdateCallback = function (physics, render) {
        this.physics = physics;
        this.render = render;
    };
    UpdateCallback.prototype = {
        update: function(node, nv) {
            this.physics.switchBuffer();
            this.render.setDisplayTexture( this.physics.getDisplayTexture() );
        }
    };

    root.setUpdateCallback(new UpdateCallback(physics, render));
    

    root.addChild(physics.root);
    root.addChild(render.root);

    return root;
};