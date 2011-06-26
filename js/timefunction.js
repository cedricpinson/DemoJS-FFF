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
                     "end": 0.1,
                 },
                 "FRQMusicKick": 
                 { 
                     "start": 0.1,
                     "stay": 0.0001,
                     "end": 0.1,
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
        if (duration[eventName] !== undefined) {
            start = duration[eventName].start;
            stay = duration[eventName].stay;
            end = duration[eventName].end;
        }
        anim(eventName,dictObject[eventName]).to( time-start,
                                                  { value:1.0 },
                                                  start,
                                                  Timeline.Easing.Linear.EaseNone
                                                ).to(
                                                    stay,
                                                    { value:0.0},
                                                    end,
                                                    Timeline.Easing.Linear.EaseNone
                                                );
    }

    var axisIndex = 0;
    var selectAxis = function() {
        this.axis = axisIndex;
        axisIndex = (axisIndex + 1)%2;

        this.axisDirection = 1;
        if (0.5 - Math.random() < 0.0) {
            this.axisDirection = -1;
        }
    };


    dictObject.Text1 = { value: 0.0};
    anim("Text1",dictObject.Text1).to(
        0.018,
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

    dictObject.FreezeText = { value: 0.0};
    anim("FreezeText", dictObject.FreezeText).to( 
        0.018,
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
        7.4,
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


    return dictObject;
};