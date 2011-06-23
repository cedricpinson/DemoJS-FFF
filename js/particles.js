/** -*- compile-command: "jslint-cli particles.js" -*- */
var initParticles = function() {

    var root = new osg.Node();
    root.setNodeMask(0);
    var textureSize = [512, 512];
    textureSize = [1024, 1024];
    textureSize = [1024, 512];
    textureSize = [512, 512];

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
            "uniform int rtt;",
            "uniform sampler2D PreviousPosX;",
            "uniform sampler2D PreviousPosY;",
            "uniform sampler2D PreviousPosZ;",
            "uniform sampler2D PosX;",
            "uniform sampler2D PosY;",
            "uniform sampler2D PosZ;",
            "uniform sampler2D DistanceMap;",
            "uniform int freeze;",
            "uniform float weightDistanceMap;",
            "uniform float weightVelocityField;",
            "float life;",
            "float distance;",
            "float material;",
            "float unpack(vec4 vec) {",
            "  return vec[0] * 255.0 / 256.0 + vec[1] * 255.0 / (256.0 * 256.0) + vec[2] * 255.0 / (256.0 * 256.0 * 256.0);",
            "}",
            "vec4 pack(float value) {",
            "  return vec4(floor(value * 256.0)/255.0, floor(fract(value * 256.0) * 256.0)/255.0 , floor(fract(value * 65536.0) * 256.0)/255.0, 0.0);",
            "}",
            "vec3 getSpawnPosition(float offset) {",
            "   vec3 center = vec3(0.5, 0.70, 0.5);",
            "   vec2 size = vec2(0.7, 0.4);",
            "   vec3 corner = center - vec3(size.x/2.0, 0.0, size.y/2.0);",
            "   vec3 pos = vec3(size.x* FragTexCoord0.x, -offset + 0.1 + 0.1*cos(4.0*FragTexCoord0.x), size.y*FragTexCoord0.y + 0.05*cos(4.0*FragTexCoord0.x))+corner;",
            "   material = 0.0;",
            "   return pos;",
            "}",
            "vec3 getVelocityField(vec3 pos) {",
            "   float vx = 0.0+cos(0.5+2.0*(pos.x*pos.x*time));",
            "   float vy = cos(4.0*(pos.y*time+0.5)) + sin(4.0*pos.x*time*time);",
            "   float vz = cos(pos.z*2.0*time);",
            "   vec3 vel = vec3( vx, vy, vz);",
            "   return normalize(vel);",
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
            "   life = p0[3];",
            "   material = p2[3];",
            "   return vec3(unpack(p0), unpack(p1), unpack(p2));",
            "}",
            "float getDistance(vec3 pos) {",
            "   float d = texture2D( DistanceMap, vec2(pos.x, pos.z)).b;",
            "   return d;",
            "   float d2 = 2.0*abs(0.5-pos.y);",
            "   return max(d2,d);",
            "}",
            "vec3 getDirection(vec3 pos) {",
            "   vec4 d = texture2D( DistanceMap, vec2(pos.x, pos.z));",
            "   vec2 grad = d.rg;",
            "   vec3 dir = vec3(0.5-grad[0], 0.125*(0.5-pos.y), 0.5-grad[1]);",
            "   //dir = normalize(dir) * (1.0 - d.b);",
            "   dir = normalize(dir);",
            "   return dir;",
            "}",
            "vec3 verlet(vec3 prevPosition, vec3 currentPosition, float dt) {",
            "   if (life <= 3.0/255.0 && life >= 1.0/255.0) {",
            "      return getSpawnPosition(0.0);",
            "      float amp = 0.005;",
            "      return vec3(0.5+sin(FragTexCoord0.x*2.0+time)*amp, 0.5+sin(FragTexCoord0.y*2.0+time)*amp, 0.5 + cos(FragTexCoord0.y*2.0+time)*amp);",
            "   } else if (life < 1.0/255.0) {",
            "      life = sin(FragTexCoord0.y*time*0.2) * 0.25 + cos(FragTexCoord0.x*time*1.5) * 0.25 + sin(time) * 0.25 + 0.74;",
            "      return getSpawnPosition(0.005);",
            "   }",
            "   vec3 acceleration = vec3(0.0, 0.0, 0.0*(-9.81 + 9.5));",
            "   vec3 targetVec = vec3(0.0,0.0,0.0);",
            "   targetVec = getVelocityField(currentPosition)*weightVelocityField*0.5;",
            "   targetVec += getDirection(currentPosition)*weightDistanceMap*0.4;",
            "   ",
            "   vec3 velocity = (currentPosition-prevPosition);",
            "   float wind = 1.0;",
            "   acceleration += targetVec * 0.1;",
            "   ",
            "   //acceleration *= 0.5;",
            "   distance = getDistance(currentPosition)*weightDistanceMap;",
            "   if ( distance > 0.3) {",
            "      //acceleration *= 0.5;",
            "      //velocity *= 0.0;",
            "      //wind = 2.5;",
            "      //velocity *= 0.98;",
            "      //acceleration *= 0.01;",
            "      //wind = 0.0;",
            "      if (freeze == 1) {",
            "         material = 1.0;",
            "      }",
            "   }",
            "      ",
            "   vec3 dir = normalize(velocity);",
            "   float l = length(velocity);",
            "   float maxSpeed = 0.005;",
            "   if (l > 0.001) {",
            "      acceleration += -dir * 0.35 * wind;",
            "      velocity = dir * min(maxSpeed, l); //cap velocity",
            "   }",
            "   vec3 next = (currentPosition + velocity + acceleration * (dt * dt));",
            "   return next;",
            "}",
            "",
            "void main(void) {",
            "   float dt = 1.0/60.0;",
            "   vec3 previousPos = getPreviousPosition();",
            "   vec3 currentPos = getCurrentPosition();",
            "   life = max(life-dt/8.0, 0.0);",
            "   vec3 next = verlet(previousPos, currentPos, dt);",
            "   vec4 x = pack(next.x);",
            "   vec4 y = pack(next.y);",
            "   vec4 z = pack(next.z);",
            "   vec4 value;",
            "   if (bits == 0) {",
            "      value = x;",
            "      value[3] = life;",
            "   } else if (bits == 1) {",
            "      value = y;",
            "      value[3] = distance;",
            "   } else if (bits == 2){",
            "      value = z;",
            "      value[3] = material;",
            "   }",
            "   gl_FragColor = value;",
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

    var textureDistance = new osg.Texture();
    var loadNext = function() {
        var img = new Image;
        img.onload = ready;
        img.src = 'gradient.png';
        textureDistance.setImage(img);
    };

    var defaultImage = new Image();
    defaultImage.onload = loadNext;
    //defaultImage.src = 'texture.png';
    defaultImage.src = "texture_" + textureSize[0] + "_" + textureSize[1] + ".png";


    var textureIndex = 0;
    var createTexture = function() {
        var texture = new osg.Texture();
        texture.setImage(defaultImage);
        texture.setTextureSize(textureSize[0], textureSize[1]);
        texture.setMinFilter('NEAREST');
        texture.setMagFilter('NEAREST');
        texture.indexID = textureIndex;
        textureIndex++;
        return texture;
    };

    var physicsTextures = [
        [ createTexture(), createTexture(), createTexture()],
        [ createTexture(), createTexture(), createTexture()],
        [ createTexture(), createTexture(), createTexture()]
    ];


    var uniformTime = osg.Uniform.createFloat1(0.0,'time');
    var freeze = osg.Uniform.createInt1(0,'freeze');
    var weightVelocityField = osg.Uniform.createFloat1(1,'weightVelocityField');
    var weightDistanceMap = osg.Uniform.createFloat1(1,'weightDistanceMap');

    var Physics = function(cameras, textures) {
        this.cameras = cameras;
        
        var node = new osg.Node();
        node.addChild(cameras[0]);
        node.addChild(cameras[1]);
        node.addChild(cameras[2]);
        this.root = node;
        this.index = 0;

        this.buffers = textures;
        this.time = uniformTime;

        this.setNodeMask();
    };

    Physics.prototype = {
        setNodeMask: function() {
            this.cameras[0].setNodeMask(0);
            this.cameras[1].setNodeMask(0);
            this.cameras[2].setNodeMask(0);
            this.cameras[this.index].setNodeMask(~0x0);
        },
        switchBuffer: function() {
            this.index = (this.index + 1) %3;
            this.setNodeMask();
        },
        getDisplayTexture: function() {
            return this.buffers[this.index];
        }
    };

    var createPhysics = function() {
        
        var previousPosX = osg.Uniform.createInt1(0,'PreviousPosX');
        var previousPosY = osg.Uniform.createInt1(1,'PreviousPosY');
        var previousPosZ = osg.Uniform.createInt1(2,'PreviousPosZ');

        var currentPosX = osg.Uniform.createInt1(3,'PosX');
        var currentPosY = osg.Uniform.createInt1(4,'PosY');
        var currentPosZ = osg.Uniform.createInt1(5,'PosZ');

        var distanceMap = osg.Uniform.createInt1(6,'DistanceMap');

        var viewport = new osg.Viewport(0,0,textureSize[0],textureSize[1]);

        var createCamera = function(bits, index) {

            var camera = new osg.Camera();
            camera.setRenderOrder(osg.Camera.PRE_RENDER, 0);
            camera.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
            camera.setClearMask(0);
            camera.useBits = "useBits " + bits;
            camera.setProjectionMatrixAsOrtho(0, 1, 0, 1, -1, 1);
            camera.setViewport(viewport);

            var quad = osg.createTexturedQuad(0, 0, 0,
                                              1,  0, 0,
                                              0,  1, 0);
            quad.useBits = camera.useBits;
            camera.addChild(quad);

            var prg = createParticlesShader();
            var stateset = quad.getOrCreateStateSet();

            stateset.setAttributeAndMode(prg);
            stateset.setAttributeAndMode(new osg.Depth('DISABLE'));
            stateset.addUniform(osg.Uniform.createInt1(bits,'bits'));

            stateset.addUniform(osg.Uniform.createInt1(index,'rtt'));

            stateset.addUniform(previousPosX);
            stateset.addUniform(previousPosY);
            stateset.addUniform(previousPosZ);
            stateset.addUniform(currentPosX);
            stateset.addUniform(currentPosY);
            stateset.addUniform(currentPosZ);
            stateset.addUniform(distanceMap);

            stateset.addUniform(uniformTime);
            stateset.addUniform(freeze);
            stateset.addUniform(weightVelocityField);
            stateset.addUniform(weightDistanceMap);
            
            var idx;
            idx = (index + 1)%3;
            stateset.setTextureAttributeAndMode(0, physicsTextures[idx][0]);
            stateset.setTextureAttributeAndMode(1, physicsTextures[idx][1]);
            stateset.setTextureAttributeAndMode(2, physicsTextures[idx][2]);

            idx = (index + 2)%3;
            stateset.setTextureAttributeAndMode(3, physicsTextures[idx][0]);
            stateset.setTextureAttributeAndMode(4, physicsTextures[idx][1]);
            stateset.setTextureAttributeAndMode(5, physicsTextures[idx][2]);

            stateset.setTextureAttributeAndMode(6, textureDistance);

            camera.statesetGeometry = stateset;

            camera.attachTexture(gl.COLOR_ATTACHMENT0, physicsTextures[index][bits]);
            return camera;
        };

        var cameras = [];
        for (var c = 0, l = 3; c < l; c++) {
            var grp = new osg.Node();
            var x = createCamera(0, c);
            var y = createCamera(1, c);
            var z = createCamera(2, c);
            grp.addChild(x);
            grp.addChild(y);
            grp.addChild(z);
            cameras.push(grp);
        }
        var ph = new Physics(cameras,physicsTextures);
        return ph;
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
        var b = node.getBound();
        b.set([0.5, 0.5, 0.5], 1.0);

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
            "float life;",
            "float distance;",
            "float material;",
            "float unpack(vec4 vec) {",
            "  return vec[0] * 255.0 / 256.0 + vec[1] * 255.0 / (256.0 * 256.0) + vec[2] * 255.0 / (256.0 * 256.0 * 256.0);",
            "}",
            "float getSmoothDead(float value) {",
            "  return 1.0-pow(1.0-value,6.0);",
            "}",
            " // (2 + -((x-0.5)*(x-0.5) * 8))*0.5",
            "float getSmoothDead2(float x) {",
            "  return (2.0 + -(pow(x-0.5,2.0) * 8.0))*0.5;",
            "}",
            "void main(void) {",
            "  vec2 uv = vec2(Vertex.x, Vertex.y);",
            "  vec4 xvec = texture2D( X, uv);",
            "  vec4 yvec = texture2D( Y, uv);",
            "  vec4 zvec = texture2D( Z, uv);",
            "  life = xvec[3];",
            "  distance = yvec[3];",
            "  material = zvec[3];",
            "  float x = unpack(xvec);",
            "  float y = unpack(yvec);",
            "  float z = unpack(zvec);",
            "  vec4 p = vec4(x,y,z,0);",
            "  vec4 v;",
            "  v[3] = 1.0;",
            "  v[0] = x;",
            "  v[1] = y;",
            "  v[2] = z;",
            "  color = vec4(uv.x, uv.y, 0.0, 1.0);",
            "  float alpha = getSmoothDead2(life);",
            "  float distFromEdge = 1.0;",
            "  if ( false && (distance-0.5) < 0.0 ) { // disable to always see particles", 
            "     distFromEdge = 1.0 - 2.0 * abs( distance-0.5);",
            "  }",
            "  color = vec4(x * alpha , y * alpha, z * alpha, alpha * distFromEdge);",
            "  if (material > 0.5) {",
            "  //if (distance > 0.5 && distance < .8 ) {",
            "     float b = 0.0 * (1.0-distance);",
            "     color = vec4(b, b, b, 1.0 * alpha);",
            "  }",
            "  gl_Position = ProjectionMatrix * ModelViewMatrix * v;",
            "  gl_PointSize = 2.0;",
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
            "if (color[3] < 0.01) {",
            "   discard;",
            "}",
            "gl_FragColor = color;",
            "}",
            ""
        ].join('\n');

        var program = new osg.Program(
            new osg.Shader(gl.VERTEX_SHADER, vertex),
            new osg.Shader(gl.FRAGMENT_SHADER, fragment));
        
        var stateset = geom.getOrCreateStateSet();
        stateset.setAttributeAndMode(program);
        stateset.setAttributeAndMode(new osg.BlendFunc('ONE', 'ONE_MINUS_SRC_ALPHA'));

        stateset.addUniform(osg.Uniform.createInt1(0,"X"));
        stateset.addUniform(osg.Uniform.createInt1(1,"Y"));
        stateset.addUniform(osg.Uniform.createInt1(2,"Z"));

        return new Render(node, stateset);
    };

    var physics = createPhysics();
    var render = createRender();
    render.setDisplayTexture(physics.getDisplayTexture());


    var timeObjects = timeSetup(timeEvents);

    var UpdateCallback = function (physics, render) {
        this.physics = physics;
        this.render = render;
    };
    UpdateCallback.prototype = {
        update: function(node, nv) {
            var t = nv.getFrameStamp().getSimulationTime();

            weightVelocityField.set([0.5 + 0.5*Math.cos(t*0.2)]);
            weightDistanceMap.set([1.0 + 0.0* (0.5 + 0.5*Math.cos(t*0.666666))]);

            //weightVelocityField.set([timeObjects.FRQMusicRiff.value]);
            //weightDistanceMap.set([timeObjects.FRQMusicChangePattern.value]);
            freeze.set([timeObjects.FRQMusicChangePattern.value]);
            osg.log(timeObjects.FRQMusicChangePattern.value);

            this.physics.switchBuffer();
            this.render.setDisplayTexture( this.physics.getDisplayTexture() );
            uniformTime.set([t]);
            node.traverse(nv);
        }
    };

    root.setUpdateCallback(new UpdateCallback(physics, render));

    
    //physics.root.setNodeMask(0);

    root.addChild(physics.root);
    root.addChild(render.root);


    if (false) {
        document.addEventListener(
            "keydown", 
            function(event) {
                osg.log("freeze");
                freeze.set([1]);
                window.setTimeout(function() {
                    freeze.set([0]);
                    osg.log("unfreeze");
                },600);
            }, 
            false);
    }


    //return new osg.Node();
    return root;

};
