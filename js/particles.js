/** -*- compile-command: "jslint-cli particles.js" -*-
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


var initParticles = function() {
    var optionsURL = function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

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
            "uniform sampler2D model0;",
            "uniform sampler2D model1;",
            "uniform float scaleModel0;",
            "uniform float scaleModel1;",

            "uniform vec3 posModel0;",
            "uniform vec3 posModel1;",

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
            "uniform float windIntro;",

            "uniform float modelRatio;",
            "uniform float showModel;",

            "uniform float equalizer;",
            "uniform float equalizerLevel0;",
            "uniform float equalizerLevel1;",
            "uniform float equalizerLevel2;",
            "uniform float equalizerLevel3;",

            "uniform int introTextScene;",
            "uniform int equalizerScene;",

            "const vec3 worldCenter = vec3(0.5, 0.5, 0.5);",
            
            "float life;",
            "float distance;",
            "float material;",
            "const float PI = 3.1415926535;",
            "vec3 targetVec;",
            "const int equaNumberDisplay = 4;",
            "const int equaNumber = 4;",
            "const float equaRange = 0.5;",
            "vec3 equaBottom[equaNumber];",
            "vec3 equaSize[equaNumber];",
            "float equaLevel[equaNumber];",
            "const vec3 equaBottom0 = vec3(0.2, 0.1, 0.2);",
            "const vec3 equaSize0 = vec3(0.1, 0.5, 0.5);",

            "const vec3 equaBottom1 = vec3(0.4, 0.1, 0.2);",
            "const vec3 equaSize1 = vec3(0.1, 0.5, 0.5);",

            "const vec3 equaBottom2 = vec3(0.6, 0.1, 0.2);",
            "const vec3 equaSize2 = vec3(0.1, 0.5, 0.5);",

            "const vec3 equaBottom3 = vec3(0.8, 0.1, 0.2);",
            "const vec3 equaSize3 = vec3(0.1, 0.5, 0.5);",

            "float unpack(vec4 vec) {",
            "  return vec[0] * 255.0 / 256.0 + vec[1] * 255.0 / (256.0 * 256.0) + vec[2] * 255.0 / (256.0 * 256.0 * 256.0);",
            "}",
            "vec4 pack(float value) {",
            "  return vec4(floor(value * 256.0)/255.0, floor(fract(value * 256.0) * 256.0)/255.0 , floor(fract(value * 65536.0) * 256.0)/255.0, 0.0);",
            "}",

            "vec2 getModelBaseUV() {",
            "  float v = (FragTexCoord0.y - 0.5)*2.0;",
            "  float u = FragTexCoord0.x;",
            "  u = (floor(u*512.0))/512.0;",
            "  return vec2(u,v);",
            "}",

            "vec3 getModel0(vec2 uvx, vec2 uvy, vec2 uvz) {",
            "  float x = unpack(texture2D( model0, uvx));",
            "  float y = unpack(texture2D( model0, uvz));",
            "  float z = unpack(texture2D( model0, uvy));",
            "  return vec3(x,y,z);",
            "}",

            "vec3 getModel1(vec2 uvx, vec2 uvy, vec2 uvz) {",
            "  float x = unpack(texture2D( model1, uvx));",
            "  float y = unpack(texture2D( model1, uvz));",
            "  float z = unpack(texture2D( model1, uvy));",
            "  return vec3(x,y,z);",
            "}",
            "vec3 getModel(float ratio) {",
            "  vec3 modelPosition = vec3(0.7,0.7,0.5);",
            "  vec2 uvx = getModelBaseUV();",
            "  vec2 uvy = uvx + vec2(1.0/2048.0, 0.0);",
            "  vec2 uvz = uvx + vec2(2.0/2048.0, 0.0);",
            "  vec3 centerPos = getModel0(uvx, uvy, uvz)-worldCenter;",
            "  vec3 centerPos2 = getModel1(uvx, uvy, uvz)-worldCenter;",
            "  vec3 finalPos = posModel0 + (modelMatrix * (vec4(centerPos* scaleModel0, 1.0))).xyz;",
            "  vec3 finalPos2 = posModel1 + (modelMatrix * (vec4(centerPos2* scaleModel1, 1.0))).xyz;",
            "  vec3 rrr = finalPos*(1.0-modelRatio) + modelRatio*finalPos2;",
            "  return rrr;",
            "}",

            "void initEquaArrays() {",
            " equaBottom[0] = equaBottom0;",
            " equaBottom[1] = equaBottom1;",
            " equaBottom[2] = equaBottom2;",
            " equaBottom[3] = equaBottom3;",
            " equaSize[0] = equaSize0;",
            " equaSize[1] = equaSize1;",
            " equaSize[2] = equaSize2;",
            " equaSize[3] = equaSize3;",
            " equaLevel[0] = equalizerLevel0;", 
            " equaLevel[1] = equalizerLevel1;", 
            " equaLevel[2] = equalizerLevel2;", 
            " equaLevel[3] = equalizerLevel3;",
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

            "vec3 getSpawnModel(float offset) {",
            "   float size = 0.2;",
            "   float a = 2.0 * 3.14159 * FragTexCoord0.x;",
            "   float b = 2.0 * 3.14159 * FragTexCoord0.y;",
            "   vec3 pos = worldCenter + vec3(cos(a), cos(a)+sin(b), cos(b)) * size;",
            "   material = 0.0;",
            "   return pos;",
            "}",
            "",
            "vec3 getSpawnPositionBoundingBox(vec3 center, vec3 size, float offset, float y) {",
            "   vec3 corner = center - size*0.5;",
            "   vec3 pos = vec3(size.x*y , 0.0*offset , size.z * FragTexCoord0.x)+corner;",
            "   material = 0.0;",
            "   distance = 0.0;",
            "   return pos;",
            "}",
            "vec3 getSpawnPosition2(float offset) {",
            "   vec3 size = vec3(0.9, 0.0,  0.5);",
            "   vec3 corner = worldCenter - size*0.5;",
            "   vec3 pos = vec3(size.x * FragTexCoord0.x*(1.0 + 5.0*offset), 0.0*(-offset + 0.1 + 0.1*cos(4.0*FragTexCoord0.x)), size.z*FragTexCoord0.y + 0.05*cos(4.0*FragTexCoord0.x))+corner;",
            "   material = 0.0;",
            "   return pos;",
            "}",

            "vec3 getSpawnPosition(float offset) {",
            "   if (equalizerScene == 1) {",
            "     if (FragTexCoord0.y < equaRange) {",
            "      float step = equaRange/float(equaNumber);",
            "      for (int i = 0; i < equaNumberDisplay; i++) {",
            "         if (FragTexCoord0.y < float(i+1)*step) {",
            "            vec3 bottom = equaBottom[i];",
            "            vec3 size = equaSize[i];",
            "            vec3 center = vec3(bottom.x, bottom.y, bottom.z+size.z/2.0);",
            "            vec4 texel = texture2D( DistanceMap, FragTexCoord0);",

            "            return getSpawnPositionBoundingBox(center, size, -offset*.03, (FragTexCoord0.y-(float(i)*step))/step + texel.g*texel[i]*step*float(i));",
            "         }",
            "      }} else {",
            "        material = 0.0;",
            "        return getModel(modelRatio);",
            "     }",
            "   }",
            "   if (introTextScene == 1) {",
            "      return getSpawnPosition2(0.0*offset);",
            "   }",
            "   material = 0.0;",
            "   return vec3(0.0, -1000000.0, 0.0);",

            "   //return getSpawnModel(offset);",
            "   vec3 size = vec3(0.7, 0.0,  0.4);",
            "   vec3 corner = worldCenter - size*0.5;",
            "   vec3 pos = vec3(size.x* FragTexCoord0.x, -offset + 0.1 + 0.1*cos(4.0*FragTexCoord0.x), size.z*FragTexCoord0.y + 0.05*cos(4.0*FragTexCoord0.x))+corner;",
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
            "vec2 computeUV(vec3 center, vec3 size , vec3 pos) {",
            "   vec3 pos2 = pos;",
            "   pos2 = pos2 / vec3(size.x, 1.0, size.z);",
            "   return vec2(pos2.x + 0.5, pos2.z + 0.5);",
            "}",
            "int computeEqualizer(vec3 currentPosition, vec3 bottom, vec3 size, float level) {",
            "        size.z *= level;",
            "        vec3 center = bottom + vec3(0.0, 0.0, size.z/2.0);",
            "        if (pointInsideBoundingBox(center, size, currentPosition) == 0) {",
            "           return 0;",
            "        }",
            "        vec3 diff = currentPosition - center;",
            "        vec4 texel = texture2D( DistanceMap, computeUV(center, size, diff));",
            "        vec2 grad = texel.rg;",
            "        vec3 dir = vec3(0.5-grad[0], 0.125*(0.5-currentPosition.y), 0.5-grad[1]);",
            "        dir = normalize(dir);",
            "        targetVec += dir * weightDistanceMap*0.4;",
            "        //distance = 1.0;",
            "        if (weightDistanceMap > 0.001) {",
            "            distance = texel.b * weightDistanceMap;",
            "        }",
            "        return 1;",
            "}",

            

            "vec3 verlet(vec3 prevPosition, vec3 currentPosition, float dt) {",
            "   if (introTextScene == 1) { // need to have a flag for the text part",
            "      currentPosition = worldCenter+(modelMatrix * vec4(currentPosition-worldCenter,1.0)).xyz;",
            "   }",
            "   float wind = 1.0;",
            "   vec3 velocity = (currentPosition-prevPosition);",
            "   vec3 acceleration = vec3(0.0, 0.0, 0.0*(-9.81 + 9.5));",
            "   targetVec = vec3(0.0,0.0,0.0);",
            "   //targetVec = getVelocityField(currentPosition)*weightVelocityField;",
            "   if (rotationZ >= 0.01) {",
            "      targetVec += getRotationalVelocityField(currentPosition, vec3(0.0, 0.0, 1.0), rotationZ);",
            "   }",

            "   if (introTextScene == 1) { // need to have a flag for the text part",
            "      if (rotationX >= 0.01) {",
            "         targetVec += getRotationalVelocityField(currentPosition, vec3(1.0, 0.0, 0.0), rotationX);",
            "      }",
            "      targetVec += getDirection(currentPosition)*weightDistanceMap*0.4;",
            "      wind = windIntro;",
            "      if (weightDistanceMap > 0.001) {",
            "         distance = getDistance(currentPosition)*weightDistanceMap;",
            "      }",
            "      if (freeze == 1) {",
            "         if ( distance > 0.3) {",
            "           material = distance;",
            "         }",
            "      }",
            "   } else if (equalizerScene == 1) {",
            "       if (FragTexCoord0.y < equaRange) {", 

            "          if (computeEqualizer(currentPosition, equaBottom0, equaSize0, equalizerLevel0) == 0) { ",
            "             if (computeEqualizer(currentPosition, equaBottom1, equaSize1, equalizerLevel1) == 0) {",
            "                if (computeEqualizer(currentPosition, equaBottom2, equaSize2, equalizerLevel2) == 0) {",
            "                   computeEqualizer(currentPosition, equaBottom3, equaSize3, equalizerLevel3);",
            "        } } } ",
            "         if ( distance > 0.5) {",
            "           material = distance;",
            "         }",
            "       } else {",
            "          //life = 0.6;",
            "          //life = 0.6;",
            "          material = showModel;",
            "          distance = 1.0;",
            "          wind = 0.1;",
            "          vec3 rrr = getModel(modelRatio);",
            "          vec3 vec = rrr-currentPosition;",
            "          distance = (0.5-length(vec))/0.5;",
            "          distance = max(distance, 1.0);",
            "          targetVec += vec*5.0;",
            "          targetVec += 3.0*getVelocityField(currentPosition)*weightVelocityField;",
            "          if (rotationX >= 0.01) {",
            "             targetVec += getRotationalVelocityField(currentPosition, vec3(1.0, 0.0, 0.0), rotationX);",
            "          }",
            "          //targetVec *= 0.0;",
            "          //velocity *= 0.0;",
            "          //currentPosition = rrr;",
            "       }",
            "    }",
            "",
            "   acceleration += targetVec ;", //* 0.5;",
            "   ",
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
            "   if (equalizerScene == 1) {",
            "     initEquaArrays();",
            "   }",

            "   float dt = 1.0/60.0;",
            "   vec3 previousPos = getPreviousPosition();",
            "   vec3 currentPos = getCurrentPosition();",
            "   if (equalizerScene == 1) {",
            "      if (FragTexCoord0.y < equaRange) {",
            "         life = max(life-dt, 0.0);",
            "      } else {",
            "         life = max(life-dt/8.0, 0.0);",
            "      }",
            "   }",
            "   if (material > 0.3 && equalizerScene == 0) {",
            "      life = max(life-dt/3.0, 0.0);",
            "   } else {",
            "      life = max(life-dt/1.5, 0.0);",
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

    var setNeareastFilter = function(texture) {
        texture.setMinFilter('NEAREST');
        texture.setMagFilter('NEAREST');
    };

    // wait at list one second 
    var loadingStart = new Date().getTime();
    var durationLoading = 1.0;
    var loadingComplete = function() {
        var funcToComplete = function() {
            removeLoading();
            setTimeout(function() {ready(); }, 500);
        };

        loadingComplete.nbLoad--;
        if (loadingComplete.nbLoad < 0) {
            osg.log("loadingComplete called more than needed");
        }
        if (loadingComplete.nbLoad === 0) {
            var finished = new Date().getTime();
            var diff = (finished-loadingStart)/1000.0;
            if ((diff-0.5) < durationLoading) {
                setTimeout(funcToComplete, (durationLoading-diff)*1000.0);
            } else {
                funcToComplete();
            }
        }
    };
    loadingComplete.nbLoad = 0;
    loadingComplete.addRessource = function() {
        loadingComplete.nbLoad++;
    };

    var texturePoint = new osg.Texture();
    var loadPoint = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'point.png';
        texturePoint.setImage(img);
        //setNeareastFilter(textureEqua);
    };

    var textureEqua = new osg.Texture();
    var loadEqua = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'equa2_grad.png';
        textureEqua.setImage(img);
        setNeareastFilter(textureEqua);
    };

    var textureFR = new osg.Texture();
    var loadFR = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'FRequency_grad.png';
        textureFR.setImage(img);
        setNeareastFilter(textureFR);
    };

    var textureSY = new osg.Texture();
    var loadSY = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'SynRJ_grad.png';
        textureSY.setImage(img);
        setNeareastFilter(textureSY);
    };

    var textureBy = new osg.Texture();
    var loadBy = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'By_grad.png';
        textureBy.setImage(img);
        setNeareastFilter(textureBy);
    };

    var textureTitle = new osg.Texture();
    var loadTitle = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'Title_grad.png';
        textureTitle.setImage(img);
        setNeareastFilter(textureTitle);
    };

    var textureModel0 = new osg.Texture();
    var loadModel0 = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'model0.png';
        textureModel0.setImage(img);
        setNeareastFilter(textureModel0);
    };

    var textureModel1 = new osg.Texture();
    var loadModel1 = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'model1.png';
        textureModel1.setImage(img);
        setNeareastFilter(textureModel1);
    };

    var textureModel2 = new osg.Texture();
    var loadModel2 = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'model2.png';
        textureModel2.setImage(img);
        setNeareastFilter(textureModel2);
    };

    var textureModel3 = new osg.Texture();
    var loadModel3 = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'model3.png';
        textureModel3.setImage(img);
        setNeareastFilter(textureModel3);
    };

    var textureModel4 = new osg.Texture();
    var loadModel4 = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'model4.png';
        textureModel4.setImage(img);
        setNeareastFilter(textureModel4);
    };

    var textureModel5 = new osg.Texture();
    var loadModel5 = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'model5.png';
        textureModel5.setImage(img);
        setNeareastFilter(textureModel5);
    };

    var textureModel6 = new osg.Texture();
    var loadModel6 = function() {
        var img = new Image;
        loadingComplete.addRessource();
        img.onload = function() { loadingComplete() };
        img.src = 'model6.png';
        textureModel6.setImage(img);
        setNeareastFilter(textureModel6);
    };


    var defaultImage;
    var loadDefaultImage = function() {
        defaultImage = new Image();
        loadingComplete.addRessource();
        defaultImage.onload = function() { loadingComplete() };
        defaultImage.src = "texture_" + textureSize[0] + "_" + textureSize[1] + ".png";
    };

    // loading
    loadDefaultImage();
    loadPoint();
    loadEqua();
    loadFR();
    loadSY();
    loadBy();
    loadTitle();
    loadModel0();
    loadModel1();
    loadModel2();
    loadModel3();
    loadModel4();
    loadModel5();
    loadModel6();


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
    var uniformEqualizerLevel0 = osg.Uniform.createFloat1(0.0,'equalizerLevel0');
    var uniformEqualizerLevel1 = osg.Uniform.createFloat1(0.0,'equalizerLevel1');
    var uniformEqualizerLevel2 = osg.Uniform.createFloat1(0.0,'equalizerLevel2');
    var uniformEqualizerLevel3 = osg.Uniform.createFloat1(0.0,'equalizerLevel3');

    var uniformEqualizerScene = osg.Uniform.createInt1(0,'equalizerScene');
    var uniformIntroTextScene = osg.Uniform.createInt1(0,'introTextScene');
    var uniformWindIntro = osg.Uniform.createFloat1(1.0, 'windIntro');

    var uniformModelRatio = osg.Uniform.createFloat1(0.0, 'modelRatio');
    var uniformShowModel = osg.Uniform.createFloat1(0.0, 'showModel');

    var uniformScaleModel1 = osg.Uniform.createFloat1(1.0, 'scaleModel1');
    var uniformScaleModel0 = osg.Uniform.createFloat1(1.0, 'scaleModel0');

    var uniformPositionModel1 = osg.Uniform.createFloat3([ 0.0, 0.0, 0.0], 'posModel1');
    var uniformPositionModel0 = osg.Uniform.createFloat3([ 0.0, 0.0, 0.0], 'posModel0');

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
        var model0 = osg.Uniform.createInt1(7,'model0');
        var model1 = osg.Uniform.createInt1(8,'model1');

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
            stateset.addUniform(uniformEqualizerScene);
            stateset.addUniform(uniformIntroTextScene);
            stateset.addUniform(uniformEqualizerLevel0);
            stateset.addUniform(uniformEqualizerLevel1);
            stateset.addUniform(uniformEqualizerLevel2);
            stateset.addUniform(uniformEqualizerLevel3);
            stateset.addUniform(uniformWindIntro);
            stateset.addUniform(uniformModelRatio);
            stateset.addUniform(uniformShowModel);

            stateset.addUniform(model0);
            stateset.addUniform(model1);
            stateset.addUniform(uniformScaleModel0);
            stateset.addUniform(uniformScaleModel1);

            stateset.addUniform(uniformPositionModel0);
            stateset.addUniform(uniformPositionModel1);

            var idx;
            idx = (index + 1)%3;
            stateset.setTextureAttributeAndMode(0, physicsTextures[idx][0]);
            stateset.setTextureAttributeAndMode(1, physicsTextures[idx][1]);
            stateset.setTextureAttributeAndMode(2, physicsTextures[idx][2]);

            idx = (index + 2)%3;
            stateset.setTextureAttributeAndMode(3, physicsTextures[idx][0]);
            stateset.setTextureAttributeAndMode(4, physicsTextures[idx][1]);
            stateset.setTextureAttributeAndMode(5, physicsTextures[idx][2]);

            //stateset.setTextureAttributeAndMode(6, textureDistance);

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
            this.stateSet.setTextureAttributeAndMode(3, texturePoint);
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
            "uniform float equalizer;",
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
            "  color = vec4(x * alpha , y * alpha, z * alpha, alpha * distFromEdge);",
            "  if (equalizer >0.0 && distance > 0.5) {",
            "     float b = (1.0-distance);",
            "     color = vec4(0.0, 0.0, 0.0, 1.0 * alpha * material);",
            "     gl_Position = ProjectionMatrix * ModelViewMatrix * v;",
            "     gl_PointSize = 2.0;",
            "     return ;",
            "  } else if (material > 0.3 && material < 0.9) {",
            "     float b = (1.0-distance);",
            "     color = vec4(0.0, 0.0, 0.0, 1.0 * alpha);",
            "     gl_Position = ProjectionMatrix * ModelViewMatrix * v;",
            "     gl_PointSize = 2.0;",
            "     return;",
            "  }",
            "  //gl_Position = ProjectionMatrix * ModelViewMatrix * v;",
            "  gl_Position = vec4(0.0,0.0,-10000.0,1.0); // clip it",
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
            "uniform sampler2D Point;",
            "void main(void) {",
            "if (color[3] < 0.01) {",
            "   discard;",
            "}",
            "vec4 col = texture2D(Point, gl_PointCoord);",
            "col *= vec4(col.a, col.a, col.a ,1.0);",
            "gl_FragColor = col*color;",
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
        stateset.addUniform(osg.Uniform.createInt1(3,"Point"));
        stateset.addUniform(uniformEqualizer);

        return new Render(node, stateset);
    };

    var physics = createPhysics();
    var render = createRender();
    render.setDisplayTexture(physics.getDisplayTexture());

    var models = [ textureModel0, textureModel1, textureModel2, textureModel3, textureModel4, textureModel5, textureModel6 ];
    var modelsScale = [ 0.4, 
                        0.2, 
                        0.2, 
                        0.2, 
                        0.2, 
                        0.5,
                        0.2
                      ];
    var modelsPos = [ [0.55,0.55,0.5],
                      [0.7,0.7,0.5],
                      [0.7,0.7,0.5],
                      [0.7,0.7,0.5],
                      [0.7,0.7,0.5],
                      [0.6,0.6,0.5],
                      [0.7,0.7,0.4] 
                    ];
    var uniformsModelScale = [uniformScaleModel0, uniformScaleModel1 ];
    var uniformsModelPosition = [uniformPositionModel0, uniformPositionModel1 ];
    
    var modelIndex = -1;
    
    changeModel = function() {
        var st = physics.root.getOrCreateStateSet();
        if (modelIndex === -1) {
            st.setTextureAttributeAndMode(7, models[0], osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);
            uniformScaleModel0.get()[0] = modelsScale[0]; uniformScaleModel0.dirty();
            uniformPositionModel0.set(modelsPos[0]);
            
            modelIndex++;
        } else {
            var previousIndex = (modelIndex)%2;
            var previousModel = modelIndex;
            modelIndex++;
            var nextIndex = (modelIndex)%2;
            var nextModel = modelIndex;

            uniformsModelScale[previousIndex].get()[0] = modelsScale[previousModel]; uniformsModelScale[previousIndex].dirty();
            uniformsModelScale[nextIndex].get()[0] = modelsScale[nextModel]; uniformsModelScale[nextIndex].dirty();

            uniformsModelPosition[previousIndex].set(modelsPos[previousModel]);
            uniformsModelPosition[nextIndex].set(modelsPos[nextModel]);


            uniformModelRatio.get()[0] = nextIndex; uniformModelRatio.dirty();

            st.setTextureAttributeAndMode(7+previousIndex, models[previousModel], osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);
            st.setTextureAttributeAndMode(7+nextIndex, models[nextModel], osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);
            //osg.log("change model from " + previousIndex + "(" + previousModel + ")  to " + nextIndex + "("+nextModel+")");
        }
    };



    var audioSound = document.getElementById('zik');
    var timeObjects = timeSetup(timeEvents);
    var firstTime = true;
    var FirstFrameCheckSoundBugHack = 0;

    var options = optionsURL();
    var UpdateCallback = function (physics, render) {
        this.physics = physics;
        this.render = render;
        this.nbUpdate = 0;
        this.previousAudioTime = 0.0;
    };
    UpdateCallback.prototype = {
        update: function(node, nv) {

            var t = audioSound.currentTime; //nv.getFrameStamp().getSimulationTime();
            t = 10.0 + 5.0*Math.cos(t);
            uniformSeed.get()[0] = Math.random();
            uniformSeed.dirty();
            uniformTime.set([t]);

            // initialize spawn buffer at the beginning
            if (this.nbUpdate === 0) {
                //forceNewLife.set([1]);
                solidModel.set([1.0]);
                weightDistanceMap.set([10.0]);
            } else if (this.nbUpdate === 1) {
                solidModel.set([0.0]);
            } else {
                if (this.nbUpdate === 3) {

                    osg.log("current audio was " + audioSound.currentTime);
                    audioSound.play();

                    this.fakeTimerStart = nv.getFrameStamp().getSimulationTime();
                    this.fakeTimer = 0.0;

                    if (options['time'] !== undefined) {
                        audioSound.currentTime = options['time'];
                        this.previousAudioTime = options['time'];
                        this.fakeTimer += options['time'];
                    } else {
                        audioSound.currentTime = 0;
                        this.previousAudioTime = 0;
                    }

                    //this.previousAudioTime = 0;

                    audioSound.volume = 1.0;
                    osg.log("start now at " + audioSound.currentTime);
                }

                var at = 0.0;
                var t = 0.0;
                if (this.nbUpdate > 2) {
                    at = nv.getFrameStamp().getSimulationTime()-this.fakeTimerStart;
                    t = at;

                    var dtAudio = at - this.previousAudioTime;
                    if (options['logtime'] !== undefined) {
                        osg.log("at " + at + " " + dtAudio);
                    }

                    this.previousAudioTime = at;
                    Timeline.getGlobalInstance().update(dtAudio);
                }
                t = 10.0 + 5.0*Math.cos(t);

                weightVelocityField.set([0.0* (0.5 + 0.5*Math.cos(t*0.2))]);
                weightDistanceMap.set([0.0 * (0.5 + 0.5*Math.cos(t*0.666666))]);
                rotationZ.set([0 * timeObjects.FRQMusicRiff.value]);
                rotationX.set([0 * timeObjects.FRQMusicRiff.value]);

                osg.Matrix.makeIdentity(modelMatrix.get());
                freeze.get()[0] = 0.0; freeze.dirty();
                
                uniformEqualizerScene.get()[0] = 0; uniformEqualizerScene.dirty();
                uniformIntroTextScene.get()[0] = 0; uniformIntroTextScene.dirty();

                if (timeObjects.EqualizerScene.value > 0.5) {
                    if (firstTime) {
                        forceNewLife.set([1]);
                    } else {
                        forceNewLife.set([0]);
                    }
                    firstTime = false;

                    uniformEqualizerScene.get()[0] = 1; uniformEqualizerScene.dirty();
                    uniformIntroTextScene.get()[0] = 0.0; uniformIntroTextScene.dirty();
                    
                    this.physics.root.getOrCreateStateSet().setTextureAttributeAndMode(6, textureEqua, osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);


                    uniformEqualizer.get()[0] = 1.0; uniformEqualizer.dirty();
                    
                    uniformEqualizerLevel0.get()[0] = timeObjects.FRQMusicSnare.value; uniformEqualizerLevel0.dirty();

                    uniformEqualizerLevel1.get()[0] = timeObjects.FRQMusicKick.value; uniformEqualizerLevel1.dirty();
                    uniformEqualizerLevel2.get()[0] = (timeObjects.FRQMusicRiff.value + timeObjects.FRQMusicSound1.value + timeObjects.FRQMusicSound2.value + timeObjects.FRQMusicSound3.value); uniformEqualizerLevel2.dirty();
                    uniformEqualizerLevel3.get()[0] = (timeObjects.FRQMusicSynth.value + timeObjects.FRQMusicVocal.value); uniformEqualizerLevel3.dirty();

                    uniformShowModel.get()[0] = timeObjects.EqualizerSceneShowModel.value; uniformShowModel.dirty();

                    rotationX.set([1.0]);
                    rotationZ.set([0.0]);
                    weightDistanceMap.set([1.0]);
                    freeze.set([1.0]);

                    var vec = [0,0,0];
                    rotationX.set([0.0]);

                    var changeAtFirefoxLogo = 1.0-timeObjects.EqualizerSceneDisplayFirefox.value;
                    weightVelocityField.set([changeAtFirefoxLogo * 0.3* (0.5 + 0.5*Math.cos(t*0.2))]);
                    
                    osg.Matrix.makeRotate(Math.PI, 0,0,1, modelMatrix.get());
                    osg.Matrix.preMult(modelMatrix.get(), osg.Matrix.makeRotate(Math.PI/3.0, 1,0,0, []));

                    var ffModelMatrixRotate = osg.Matrix.makeRotate(timeObjects.EqualizerSceneDisplayFirefox.value * (-((6.0+audioSound.currentTime)*0.5)), 0, 0, 1, []);
                    osg.Matrix.postMult(ffModelMatrixRotate, modelMatrix.get());

                    var sff = timeObjects.EqualizerSceneDisplayFirefoxScale.value;
                    var scaleff = osg.Matrix.makeScale(sff, sff ,sff, []);
                    osg.Matrix.preMult(modelMatrix.get(), scaleff);
                    modelMatrix.dirty();


                } else  {
                    //osg.log(audioSound.currentTime + " " +);

                    if (timeObjects.IntroScene.value > 0.5) {
                        uniformIntroTextScene.get()[0] = 1.0; uniformIntroTextScene.dirty();
                        uniformWindIntro.get()[0] = timeObjects.WindIntro.value; uniformWindIntro.dirty();
                        if (timeObjects.Text4.value > 0.0) {
                            this.physics.root.getOrCreateStateSet().setTextureAttributeAndMode(6, textureFR, osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);
                            var vec = [0,0,0];
                            vec[timeObjects.Text4.axis] = timeObjects.Text4.axisDirection;
                            osg.Matrix.makeRotate((1.0-timeObjects.Text4.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                        } else if (timeObjects.Text3.value > 0.0) {
                            this.physics.root.getOrCreateStateSet().setTextureAttributeAndMode(6, textureSY, osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);
                            var vec = [0,0,0];
                            vec[timeObjects.Text3.axis] = timeObjects.Text3.axisDirection;
                            osg.Matrix.makeRotate((1.0-timeObjects.Text3.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                        } else if (timeObjects.Text2.value > 0.0) {
                            this.physics.root.getOrCreateStateSet().setTextureAttributeAndMode(6, textureBy, osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);
                            var vec = [0,0,0];
                            vec[timeObjects.Text2.axis] = timeObjects.Text2.axisDirection;
                            osg.Matrix.makeRotate((1.0-timeObjects.Text2.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                        } else if (timeObjects.Text1.value > 0.0) {
                            this.physics.root.getOrCreateStateSet().setTextureAttributeAndMode(6, textureTitle, osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE);

                            var vec = [0,0,0];
                            vec[timeObjects.Text1.axis] = timeObjects.Text1.axisDirection;

                            osg.Matrix.makeRotate((1.0-timeObjects.Text1.value)*0.02, vec[0],vec[1],vec[2], modelMatrix.get());
                        }
                        
                        weightDistanceMap.set([0.8]);
                        freeze.set([timeObjects.FreezeText.value]);
                        //osg.log(audioSound.currentTime + " " + timeObjects.FreezeText.value);
                        rotationX.set([0.4]);

                        modelMatrix.dirty();
                    }
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
