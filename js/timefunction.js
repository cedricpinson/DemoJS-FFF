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
        var duration = 0.01;
        anim(eventName,dictObject[eventName]).to( time,
                                                  { value:1.0 },
                                                  0.0001,
                                                  Timeline.Easing.Linear.EaseNone
                                                ).to(
                                                    0.5,
                                                    { value:0.0},
                                                    0.1
                                                );
    }

    var selectAxis = function() {
        var axis = Math.floor(Math.random()*2.0);

        if (this.axis === undefined) {
            this.axis = axis;
            return;
        }

        if (this.axis === axis) {
            this.axis = (this.axis + 1)%2;
        } else {
            this.axis = axis;
        }
        osg.log("axis " + this.axis);
    };


    dictObject.ModelRotate = { value: 0.0};
    anim("ModelRotate",dictObject.ModelRotate).to(
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
    ).to(
        1.8,
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



    if (false) {
        anim("ModelRotateX",dictObject.ModelRotateX).to( 5.0,
                                                         { value:1.0 },
                                                         0.2,
                                                         Timeline.Easing.Cubic.EaseIn
                                                       ).to(
                                                           { value:0.0},
                                                           0.00001
                                                       );
    }

    return dictObject;
};