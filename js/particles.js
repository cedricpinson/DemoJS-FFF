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
            "uniform int forceNewLife;",
            "uniform float weightDistanceMap;",
            "uniform float weightVelocityField;",
            "uniform float solidModel;",
            "uniform float rotationZ;",
            "uniform float rotationX;",
            "uniform mat4  modelMatrix;",
            "uniform float modelRotationZ;",
            "uniform float modelRotationX;",
            "uniform float seed;",

            "uniform float equalizer;",
            "uniform float equalizerLevel;",
            
            "float life;",
            "float distance;",
            "float material;",
            "const float PI = 3.1415926535;",
            "float unpack(vec4 vec) {",
            "  return vec[0] * 255.0 / 256.0 + vec[1] * 255.0 / (256.0 * 256.0) + vec[2] * 255.0 / (256.0 * 256.0 * 256.0);",
            "}",
            "vec4 pack(float value) {",
            "  return vec4(floor(value * 256.0)/255.0, floor(fract(value * 256.0) * 256.0)/255.0 , floor(fract(value * 65536.0) * 256.0)/255.0, 0.0);",
            "}",
            "vec3 getSpawnModel(float offset) {",
            "   vec3 center = vec3(0.5, 0.5, 0.5);",
            "   float size = 0.2;",
            "   float a = 2.0 * 3.14159 * FragTexCoord0.x;",
            "   float b = 2.0 * 3.14159 * FragTexCoord0.y;",
            "   vec3 pos = center + vec3(cos(a), cos(a)+sin(b), cos(b)) * size;",
            "   //pos = center + (modelMatrix*(vec4(pos-center,1.0))).xyz;",
            "   material = 0.0;",
            "   return pos;",
            "}",
            "",
            "vec3 getSpawnPosition2(float offset) {",
            "   vec3 center = vec3(0.5, 0.50, 0.5);",
            "   vec3 size = vec3(0.7, 0.0,  0.4);",
            "   vec3 corner = center - size*0.5;",
            "   vec3 pos = vec3(size.x * FragTexCoord0.x, -offset + 0.1 + 0.1*cos(4.0*FragTexCoord0.x), size.z*FragTexCoord0.y + 0.05*cos(4.0*FragTexCoord0.x))+corner;",
            "   //pos = center + (modelMatrix*(vec4(pos-center, 1.0))).xyz;",
            "   material = 0.0;",
            "   return pos;",
            "}",
            "float getEqualizerParticleID() {",
            "   float id = FragTexCoord0.y*(511.0*512.0) + FragTexCoord0.x*511.0;",
            "   return id;",
            "}",
            "vec3 getEqualizerParticleSpawn(float t, float h) {",
            "   vec3 center = vec3(0.5, 0.5, 0.5);",
            "   float speed = t;",
            "   float radius = 0.4;",
            "   vec3 rotate = vec3(cos(speed), sin(speed), h);",
            "   return center + rotate*radius;",
            "}",
            "vec3 getSpawnEqualizer(float offset) {",
            "   material = 0.0;",
            "   distance = 0.0;",
            "   float id = getEqualizerParticleID();",
            "   return getEqualizerParticleSpawn((PI*id) / (512.0*256.0), offset);",
            "   return getEqualizerParticleSpawn(1.0*(FragTexCoord0.y*FragTexCoord0.x*5.0*3.1415)*0.6, 0.00005 *cos(time));",
            "   vec3 center = vec3(0.5, 0.5, 0.5);",
            "   float speed = 1.0*(FragTexCoord0.y*FragTexCoord0.x*5.0*3.1415)*0.6;",
            "   float radius = 0.2;",
            "   if (offset > 0.0) {",
            "      //speed += 1.0/60.0 *(FragTexCoord0.x) - 2.0/60.0 ;",
            "   }",
            "   vec3 rotate = vec3(cos(speed), sin(speed), 0.05 *cos(time));",
            "   return center + rotate*radius;",
            "}",
            "vec3 getSpawnPosition(float offset) {",
            "   if (equalizer > 0.01) {",
            "      return getSpawnEqualizer(offset);",
            "   }",
            "   return getSpawnPosition2(offset);",
            "   //return getSpawnModel(offset);",
            "   vec3 center = vec3(0.5, 0.50, 0.5);",
            "   vec3 size = vec3(0.7, 0.0,  0.4);",
            "   vec3 corner = center - size*0.5;",
            "   vec3 pos = vec3(size.x* FragTexCoord0.x, -offset + 0.1 + 0.1*cos(4.0*FragTexCoord0.x), size.z*FragTexCoord0.y + 0.05*cos(4.0*FragTexCoord0.x))+corner;",
            "   //pos = center + (modelMatrix*(vec4(pos-center, 1.0))).xyz;",
            "   material = 0.0;",
            "   return pos;",
            "}",
            "vec3 getRotationalVelocityField(vec3 pos, vec3 axis, float speed) {",
            "   float rotationalSpeed = 1.0;",
            "   vec3 fromCenter = pos-vec3(0.5,0.5,pos[2]);",
            "   vec3 vec = cross(axis, pos-vec3(0.5,0.5,pos[2]) );",
            "   float dist = length(fromCenter)*10.0 * speed;",
            "   return vec*dist;",
            "}",
            "vec3 getVelocityField(vec3 pos) {",
            "   float t = mod(time,15.0); //mod(time, 5.0);",
            "   float vx = 0.0+cos(0.5+2.0*(pos.x*pos.x*t));",
            "   float vy = cos(4.0*(pos.y*t+ seed*0.5)) + seed * sin(4.0*pos.x*t*t);",
            "   float vz = cos(pos.z*2.0*t);",
            "   vec3 vel = vec3( vx, vy, vz);",
            "   return normalize(vel);",
            "}",
            "vec3 getEqualizorField(float radiusMin, float radiusMax, vec3 pos, float virtualCursor) {",
            "   vec2 radius = vec2(radiusMin, radiusMax);",
            "   vec3 center = vec3(0.5, 0.5, pos.z);",
            "   vec3 diff = pos-center;",
            "   float l = length(diff);",
            "   if (l < radius[0] || l > radius[1]) {",
            "      return vec3(0.0,0.0,0.0);",
            "   }",
            "   float a = acos(diff[0]/l);",
            "   if (diff[1] > 0.0) {",
            "     a = -a;",
            "   }",
            "   a = mod((a + 2.0*PI), 2.0*PI);",
            "   float r = (virtualCursor - a)/ (2.0 *PI);",
            "   float range = 0.1;",
            "   float c = 1.0 - min(abs(r), range)/range;",
            "   float v = smoothstep(0.0, 1.0, c);",
            "   if (v < 0.000001) {",
            "      v = -1.0;",
            "   }",
            "   return vec3(0.0, 0.0, equalizerLevel*v);",
            "   //return center;",
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
            "   distance = p1[3];",
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
            "int pointInsideBoundingBox(vec3 center, vec3 size, vec3 pos) {",
            "   vec3 diff = center - pos;",
            "   if (diff[0] > size[0] || diff[0] < -size[0]) {",
            "      return 0;",
            "   }",
            "   if (diff[1] > size[1] || diff[1] < -size[1]) {",
            "      return 0;",
            "   }",
            "   if (diff[2] > size[2] || diff[2] < -size[2]) {",
            "      return 0;",
            "   }",
            "   return 1;",
            "}",
            "vec3 getEqualizerDirection(vec3 center, vec3 pos) {",
            "   vec3 diff = center - pos;",
            "   //dir = normalize(diff);",
            "   return diff;",
            "}",
            "vec3 verlet(vec3 prevPosition, vec3 currentPosition, float dt) {",
            "   vec3 center = vec3(0.5,0.5,0.5);",
            "   currentPosition = center+(modelMatrix * vec4(currentPosition-center,1.0)).xyz;",
            "   vec3 acceleration = vec3(0.0, 0.0, 0.0*(-9.81 + 9.5));",
            "   vec3 targetVec = vec3(0.0,0.0,0.0);",
            "   targetVec = getVelocityField(currentPosition)*weightVelocityField;",
            "   if (rotationZ >= 0.01) {",
            "      targetVec += getRotationalVelocityField(currentPosition, vec3(0.0, 0.0, 1.0), rotationZ);",
            "   }",
            "   if (rotationX >= 0.01) {",
            "      targetVec += getRotationalVelocityField(currentPosition, vec3(1.0, 0.0, 0.0), rotationX);",
            "   }",
            "   targetVec += getDirection(currentPosition)*weightDistanceMap*0.4;",
            "   ",
            "   float wind = 1.0;",
            "   vec3 velocity = (currentPosition-prevPosition);",

            "   #define NEW_EQUALIZER",
            "   #ifndef NEW_EQUALIZER",
            "   if (false) {",
            "   if (equalizer > 0.01 && material > 0.5) {",
            "      //material = 0.5;",
            "      float t = mod(time, 2.0*PI);",
            "      float tid = getEqualizerParticleID()* PI/(512.0*256.0);",
            "      float diff = min(abs(t-tid), PI/8.0)/(PI/8.0);",
            "      float v = 0.01*max(1.0,length(velocity));",
            "      float r = (1.0-(diff*diff));",
            "      float amp = max(equalizerLevel, 0.0);",
            "      material = 0.49;",
            "      wind = 0.0;",
            "      prevPosition = currentPosition;",
            "      currentPosition = currentPosition + vec3(0.0, 0.0, v*r*amp*15.0);",
            "      //velocity = currentPosition - prevPosition;",
            "      }",
            "   } else {",
            "      float t = mod(-time, 2.0*PI);",
            "      vec3 field = getEqualizorField(0.1, 0.5, currentPosition, t);",
            "         //material = 0.5;",
            "      if (field.z > 0.0001) {",
            "         material = 0.5;",
            "      }",
            "      float offset = (FragTexCoord0.x + FragTexCoord0.y)*0.01;",
            "      field.z = (field.z*0.99 + offset);",
            "      //targetVec += field*100.0;",
            "      //targetVec += getRotationalVelocityField(currentPosition, vec3(1.0, 0.0, 1.0), 2.0);",
            "      currentPosition = currentPosition + field*.01;",
           "       wind = 0.0;",
            "   }",
            "   #else NEW_EQUALIZER",
            "   #endif // NEW_EQUALIZER",
            "",
            "   acceleration += targetVec ;", //* 0.5;",
            "   ",
            "   if (weightDistanceMap > 0.001) {",
            "      distance = getDistance(currentPosition)*weightDistanceMap;",
            "   }",
            "   if (freeze == 1) {",
            "      if ( distance > 0.3) {",
            "         material = distance;",
            "      }",
            "   }",
            "",
            "   float l = length(velocity);",
            "   vec3 dir = velocity;",
            "   float maxSpeed = 0.005;",
            "   if (l > 0.001) {",
            "      dir = normalize(velocity);",
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
            "   if (equalizer > 0.001) {",
            "      life = max(life-dt/2.0, 0.0);",
            "   } else {",
            "   if (material > 0.3 && equalizer < 0.001) {",
            "      life = max(life-dt/3.0, 0.0);",
            "   } else {",
            "      life = max(life-dt/1.5, 0.0);",
            "   }",
            "   }",
            "   vec3 next;",
            "   if (forceNewLife == 1) {",
            "      life = 3.0/255.0;",
            "      next = currentPos;",
            "   } else {",
            "      if (life <= 3.0/255.0 && life >= 1.0/255.0) {",
            "         next = getSpawnPosition(0.0);",
            "      } else if (life < 1.0/255.0) {",
            "         life = sin((FragTexCoord0.y + FragTexCoord0.x*1.3333)*(time * seed + 3.333333)*0.2) * 0.4 + 0.5;",
            "         next = getSpawnPosition(0.005);",
            "      } else {",
            "         next = currentPos*solidModel + (1.0 - solidModel) * verlet(previousPos, currentPos, dt);",
            "      }",
            "   }",
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
    var forceNewLife = osg.Uniform.createInt1(0,'forceNewLife');
    var solidModel = osg.Uniform.createFloat1(1.0,'solidModel');
    var rotationZ = osg.Uniform.createFloat1(0.0,'rotationZ');
    var rotationX = osg.Uniform.createFloat1(0.0,'rotationX');
    var modelMatrix = osg.Uniform.createMatrix4(osg.Matrix.makeIdentity([]),'modelMatrix');
    var uniformSeed = osg.Uniform.createFloat1(Math.random(),'seed');
    var uniformEqualizer = osg.Uniform.createFloat1(0.0,'equalizer');
    var uniformEqualizerLevel = osg.Uniform.createFloat1(0.0,'equalizerLevel');


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
            stateset.addUniform(forceNewLife);
            stateset.addUniform(weightVelocityField);
            stateset.addUniform(weightDistanceMap);
            stateset.addUniform(solidModel);
            stateset.addUniform(rotationZ);
            stateset.addUniform(rotationX);
            stateset.addUniform(modelMatrix);
            stateset.addUniform(uniformSeed);
            stateset.addUniform(uniformEqualizer);
            stateset.addUniform(uniformEqualizerLevel);


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
        b.set([0.5, 0.5, 0.5], 0.5);

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
            "  //return getSmoothDead(x);",
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
            "  if (material > 0.3 && material < 0.6) {",
            "     float b = (1.0-distance);",
            "     color = vec4(0.0, 0.0, 0.0, b * 1.0 * alpha);",
            "  } else { ",
            "     //gl_Position = vec4(0.0,0.0,-10000.0,1.0); // clip it",
            "     //return;",
            "  } ",
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
        this.nbUpdate = 0;
    };
    UpdateCallback.prototype = {
        update: function(node, nv) {
            var t = nv.getFrameStamp().getSimulationTime();
            uniformSeed.get()[0] = Math.random();
            uniformSeed.dirty();
            uniformTime.set([t]);

            // initialize spawn buffer at the beginning
            if (this.nbUpdate == 0) {
                //forceNewLife.set([1]);
                solidModel.set([1.0]);
                weightDistanceMap.set([10.0]);
            } else if (this.nbUpdate == 2) {
                solidModel.set([0.0]);
            } else if (this.nbUpdate == 3) {
                var audioSound = document.getElementById('zik');
                audioSound.play();
                audioSound.currentTime = 0.0;
            } else {

                weightVelocityField.set([0.0* (0.5 + 0.5*Math.cos(t*0.2))]);
                weightDistanceMap.set([0.0 * (0.5 + 0.5*Math.cos(t*0.666666))]);
                rotationZ.set([0 * timeObjects.FRQMusicRiff.value]);
                rotationX.set([0 * timeObjects.FRQMusicRiff.value]);

                osg.Matrix.makeIdentity(modelMatrix.get());
                freeze.set([0.0]);

                if (true) {
                    if (timeObjects.Text1.value > 0.0) {
                        var vec = [0,0,0];
                        vec[timeObjects.Text1.axis] = timeObjects.Text1.axisDirection;
                        osg.Matrix.makeRotate((1.0-timeObjects.Text1.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                    } else if (timeObjects.Text2.value > 0.0) {
                        var vec = [0,0,0];
                        vec[timeObjects.Text2.axis] = timeObjects.Text2.axisDirection;
                        osg.Matrix.makeRotate((1.0-timeObjects.Text2.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                    }
                    if (timeObjects.Text3.value > 0.0) {
                        var vec = [0,0,0];
                        vec[timeObjects.Text3.axis] = timeObjects.Text3.axisDirection;
                        osg.Matrix.makeRotate((1.0-timeObjects.Text3.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                    } else if (timeObjects.Text4.value > 0.0) {
                        var vec = [0,0,0];
                        vec[timeObjects.Text4.axis] = timeObjects.Text4.axisDirection;
                        osg.Matrix.makeRotate((1.0-timeObjects.Text4.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                    }

                    weightDistanceMap.set([0.8]);
                    freeze.set([timeObjects.FreezeText.value]);
                    rotationX.set([0.4]);

                    modelMatrix.dirty();

                } else {
                    uniformEqualizer.get()[0] = 1.0; uniformEqualizer.dirty();
                    
                    uniformEqualizerLevel.get()[0] = 0.0 + 1.0 * (timeObjects.Text1.value + timeObjects.Text2.value + timeObjects.Text3.value + timeObjects.Text3.value + timeObjects.FRQMusicSnare.value); uniformEqualizerLevel.dirty();
                    rotationX.set([0.0]);
                    rotationZ.set([0.0]);
                    weightVelocityField.set([1.0* (0.5 + 0.5*Math.cos(t*0.1))]);
                    //forceNewLife.set([1]);
                }
            }

            this.physics.switchBuffer();
            this.render.setDisplayTexture( this.physics.getDisplayTexture() );

            this.nbUpdate += 1;
            node.traverse(nv);
        }
    };

    root.setUpdateCallback(new UpdateCallback(physics, render));

    
    //physics.root.setNodeMask(0);

    root.addChild(physics.root);
    root.addChild(render.root);

    return root;

};
