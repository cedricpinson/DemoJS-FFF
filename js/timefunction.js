var timeSetup = function(eventData) {
    var dictObject = {};
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
                                                    0.1,
                                                    Timeline.Easing.Linear.EaseNone
                                                );
    }

    return dictObject;
};