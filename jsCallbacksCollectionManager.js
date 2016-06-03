/* 
    Manages callbacks dictionary with ids to different callbacks allowing to override specific previous callbacks.
    Useful for example when there is a global callbacks array which different parts of the code register callbacks to and you want different parts of code not
    to override each others callbacks however to let the specific part itself override its own callback for example on window resize event.

    New callback is identified by the uniqueCallbacksId and if the previous uniqueCallbacksId is same as new uniqueCallbacksId then the callback is overridden.
    Make sure the callbacksIds and callbacksDictionary properties of the callbacks dictionary are not used outside this because they are changed here.

    Example:
    var a = {};
    addCallbacksToDictionary(a, { ona: function(){alert(1);}}, "aa");
    a.ona(); // alerts 1
    addCallbacksToDictionary(a, { ona: function(){alert(2);}}, "bb");
    a.ona(); // alerts 1 and then alerts 2
    addCallbacksToDictionary(a, { ona: function(){alert(3);}}, "aa");
    a.ona(); // alerts 3 and then alerts 2
    addCallbacksToDictionary(a, { ona: function(){alert(7);}}, "cc");
    a.ona(); // alerts 3 and then alerts 2 and then 7
    addCallbacksToDictionary(a, { ona: function(){alert(6);}}, "bb");
    a.ona(); // alerts 3 and then alerts 6 and then 7
 */
function addCallbacksToDictionary(existingCallbacksDictionary, newCallbacks, uniqueCallbacksId) {
    if ($.isEmptyObject(existingCallbacksDictionary)) {
        /* Don't just assign but make a clone to prevent circular reference in the callbacksDictionary */
        $.each(newCallbacks, function (currCallbackName, currCallback) {
            existingCallbacksDictionary[currCallbackName] = currCallback;
        });
        existingCallbacksDictionary.callbacksIds = {};
        existingCallbacksDictionary.callbacksIds[uniqueCallbacksId] = "1";
        existingCallbacksDictionary.callbacksDictionary = { "1": newCallbacks };
        existingCallbacksDictionary.callbacksDictionary.maxPriority = 1;
    }
    else {
        if (existingCallbacksDictionary.callbacksIds[uniqueCallbacksId]) {
            /* Override previous callbacks which had same id and leave new callbacks at same priority as previous */
            existingCallbacksDictionary.callbacksDictionary[existingCallbacksDictionary.callbacksIds[uniqueCallbacksId]] = newCallbacks;
        }
        else {
            existingCallbacksDictionary.callbacksDictionary.maxPriority++;
            existingCallbacksDictionary.callbacksIds[uniqueCallbacksId] = "" + existingCallbacksDictionary.callbacksDictionary.maxPriority;
            existingCallbacksDictionary.callbacksDictionary[existingCallbacksDictionary.callbacksIds[uniqueCallbacksId]] = newCallbacks;
        }

        /* Build final callbacks from the callbacks callbacksDictionary using appropriate priorities */
        Object.keys(existingCallbacksDictionary).forEach(function (key) {
            if (key !== "callbacksIds" && key !== "callbacksDictionary") {
                delete existingCallbacksDictionary[key];
            }
        });
        $.each(existingCallbacksDictionary.callbacksDictionary["1"], function (currCallbackName, currCallback) {
            existingCallbacksDictionary[currCallbackName] = currCallback;
        });
        for (var currPriority = 2, maxPriority = existingCallbacksDictionary.callbacksDictionary.maxPriority; currPriority <= maxPriority; currPriority++) {
            $.each(existingCallbacksDictionary.callbacksDictionary["" + currPriority], function (currCallbackName, currCallbackValue) {
                /* Save in closure to prevent it changing in loop */
                var currClosureCallbackName = currCallbackName;
                var currClosureCallbackValue = currCallbackValue;
                /* If new callback then just add it as is and if existing then call it after calling previous callback */
                if (existingCallbacksDictionary[currClosureCallbackName]) {
                    /* Save old function in closure to prevent calling the function itself */
                    var previousFunc = existingCallbacksDictionary[currClosureCallbackName];
                    existingCallbacksDictionary[currClosureCallbackName] = function () {
                        previousFunc();
                        currClosureCallbackValue();
                    };
                }
                else {
                    existingCallbacksDictionary[currClosureCallbackName] = currClosureCallbackValue;
                }
            });
        }
    }
}
