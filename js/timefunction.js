/** -*- compile-command: "jslint-cli timefunction.js" -*-
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

var setEqualizerCameraPosition;
var changeModel;

var timeSetup = function(eventData) {
    var dictObject = {};

    eventData.push( {
        "Event": "RotationZ",
        "Note": "", 
        "Time": "00.018"
    });

    eventData.push( {
        "Event": "RotationZ",
        "Note": "", 
        "Time": "00.418"
    });

    eventData.push( {
        "Event": "RotationZ",
        "Note": "", 
        "Time": "00.918"
    });
    

    duration = { "FRQMusicSnare": 
                 { 
                     "start": 0.1,
                     "stay": 0.0001,
                     "end": 0.1
                 },
                 "FRQMusicKick": 
                 { 
                     "start": 0.1,
                     "stay": 0.0001,
                     "end": 0.1
                 },
                 "FRQMusicVocal": 
                 { 
                     "start": 0.1,
                     "stay": 0.0001,
                     "end": 0.1,
                     "func": changeModel
                 },
                 "FRQMusicSound1": 
                 { 
                     "offset": 0.3,
                     "start": 0.2,
                     "stay": 0.3,
                     "end": 0.4
                 },
                 "FRQMusicSound2": 
                 { 
                     "offset": 0.3,
                     "start": 0.2,
                     "stay": 0.3,
                     "end": 0.4
                 },
                 "FRQMusicSound3": 
                 { 
                     "offset": 0.3,
                     "start": 0.2,
                     "stay": 0.3,
                     "end": 0.4
                 },

                 "FRQMusicSynth":
                 {
                     "offset": 0.3,
                     "start": 0.2,
                     "stay": 0.4,
                     "end": 1.2
                 },
               };



    for (var i = 0, l = eventData.length; i < l; i++) {
        var event = eventData[i];
        if (!event.Event) {
            continue;
        }
        var eventName = event.Event;
        var time = parseFloat(event.Time);
        var note = event.Note;
        if (!dictObject[eventName]) {
            var obj = {};
            
            obj.name = eventName;
            obj.value = 0.0;
            obj.note = note;
            dictObject[eventName] = obj;
        }

        var start = 0.0001;
        var stay = 0.5;
        var end = 0.1;
        var offset = 0.0;
        var func = undefined;
        if (duration[eventName] !== undefined) {
            start = duration[eventName].start;
            stay = duration[eventName].stay;
            end = duration[eventName].end;
            func = duration[eventName].func;
            if (duration[eventName].offset !== undefined) {
                offset = duration[eventName].offset;
            }
        }
        anim(eventName,dictObject[eventName]).to( time-start + offset,
                                                  { value:1.0 },
                                                  func,
                                                  start,
                                                  Timeline.Easing.Linear.EaseNone
                                                ).to(
                                                    stay,
                                                    { value:0.0},
                                                    end,
                                                    //Timeline.Easing.Cubic.EaseOut
                                                    Timeline.Easing.Linear.EaseNone
                                                );
    }


    var axisOrder = [ 0, 2 ,1,
                      2, 0, 1,
                      0, 2, 1,
                      2, 0, 1];
    var axisIndex = 0;
    var selectAxis = function() {
        this.axis = axisOrder[axisIndex++];
        this.axisDirection = 1;
        if (0.5 - Math.random() < 0.0) {
            this.axisDirection = -1;
        }
    };


    dictObject.FreezeText = { value: 0.0};
    anim("FreezeText", dictObject.FreezeText).to( 
        0.021,
        { value:1.0 },
        0.0001,
        Timeline.Easing.Linear.EaseNone
    ).to(
        0.5,
        { value:0.0},
        0.1
    );
    anim("FreezeText", dictObject.FreezeText).to( 
        3.75,
        { value:1.0 },
        0.0001,
        Timeline.Easing.Linear.EaseNone
    ).to(
        0.5,
        { value:0.0},
        0.1
    );
    anim("FreezeText", dictObject.FreezeText).to( 
        7.4,
        { value:1.0 },
        0.0001,
        Timeline.Easing.Linear.EaseNone
    ).to(
        0.5,
        { value:0.0},
        0.1
    );
    anim("FreezeText", dictObject.FreezeText).to( 
        11.1,
        { value:1.0 },
        0.0001,
        Timeline.Easing.Linear.EaseNone
    ).to(
        0.5,
        { value:0.0},
        0.1
    );


    dictObject.WindIntro = { value: 0.0};
    var windStartValue = 6.0;
    var windWaitValue = 0.5;
    var windDurationRestore = 0.2;
    var windEndValue = 0.5;
    anim("WindIntro",dictObject.WindIntro).to(
        0.02,
        { value: windStartValue },
        0.000001,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        windWaitValue,
        { value: windEndValue},
        windDurationRestore
    );
    anim("WindIntro",dictObject.WindIntro).to(
        3.75,
        { value: windStartValue },
        0.000001,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        windWaitValue,
        { value:windEndValue},
        windDurationRestore
    );
    anim("WindIntro",dictObject.WindIntro).to(
        7.45,
        { value: windStartValue },
        0.000001,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        windWaitValue,
        { value: windEndValue},
        windDurationRestore
    );
    anim("WindIntro",dictObject.WindIntro).to(
        11.1,
        { value: windStartValue },
        0.000001,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        windWaitValue,
        { value: windEndValue},
        windDurationRestore
    );


    dictObject.StateText = { value: 0.0};
    anim("StateText",dictObject.StateText).to(
        0.02,
        { value: 1.0},
        0.00001
    );
    anim("StateText",dictObject.StateText).to(
        3.75,
        { value: 2.0},
        0.00001
    );
    anim("StateText",dictObject.StateText).to(
        7.40,
        { value: 3.0},
        0.00001
    );
    anim("StateText",dictObject.StateText).to(
        11.1,
        { value: 4.0},
        0.00001
    );
        

    dictObject.Text1 = { value: 0.0};
    anim("Text1",dictObject.Text1).to(
        0.02,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        0.0,
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    );


    dictObject.Text2 = { value: 0.0};
    anim("Text2",dictObject.Text2).to(
        3.75,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        0.0,
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    );


    dictObject.Text3 = { value: 0.0};
    anim("Text3",dictObject.Text3).to(
        7.40,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        0.0,
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    );


    dictObject.Text4 = { value: 0.0};
    anim("Text4",dictObject.Text4).to(
        11.1,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        0.0,
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    ).to(
        0.8,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        { value:0.0},
        0.00001
    );




    dictObject.IntroScene = { value: 0.0};
    anim("IntroScene",dictObject.IntroScene).to(
        0.0,
        { value:1.0 },
        0.00001,
        Timeline.Easing.Linear.None
    ).to(
        14.756,
        { value:0.0},
        0.00001
    );

    dictObject.EqualizerScene = { value: 0.0 , timeStart:14.556};
    anim("EqualizerScene",dictObject.EqualizerScene).to(
        14.556,
        { value:1.0 },
        setEqualizerCameraPosition,
        0.00001,
        Timeline.Easing.Linear.None
    ).to(
        59.0,
        { value:0.0},
        0.00001
    );

    dictObject.EqualizerSceneShowModel = { value: 0.0};
    anim("EqualizerSceneShowModel",dictObject.EqualizerSceneShowModel).to(
        22.629-3.0,
        { value:1.0 },
        changeModel, // to setup the first model
        5.0,
        Timeline.Easing.Linear.None
    ).to(
        100.0,
        { value:0.0},
        0.00001
    );

    dictObject.EqualizerSceneDisplayFirefox = { value: 0.0};
    anim("EqualizerSceneDisplayFirefox",dictObject.EqualizerSceneDisplayFirefox).to(
        40.77,
        { value:1.0 },
        changeModel, // just to switch the last model
        0.5,
        Timeline.Easing.Linear.None
    ).to(
        3.0,
        { value:0.9},
        0.5
    );
    dictObject.EqualizerSceneDisplayFirefoxScale = { value: 1.0};
    anim("EqualizerSceneDisplayFirefoxScale",dictObject.EqualizerSceneDisplayFirefoxScale).to(
        40.77,
        { value: 1.5 },
        2.0,
        Timeline.Easing.Linear.None
    );

    anim("EqualizerSceneShowModel",dictObject.EqualizerSceneShowModel).to(
        54.606,
        { value: 0.0 },
        1.5,
        Timeline.Easing.Linear.None
    );


    dictObject.EqualizerSceneFinish = { value: 0.0};
    anim("EqualizerSceneFinish",dictObject.EqualizerSceneFinish).to(
        55.606,
        { value:1.0 },
        function() { showCredits(); },
        0.00001,
        Timeline.Easing.Linear.None
    );



    dictObject.ModelRotate = { value: 0.0};
    anim("ModelRotate",dictObject.ModelRotate).to(
        14.756,
        { value:1.0 },
        selectAxis,
        0.1,
        Timeline.Easing.Cubic.EaseIn
    ).to(
        0.0,
        { value:0.0},
        0.00001
    );
    

    return dictObject;
};