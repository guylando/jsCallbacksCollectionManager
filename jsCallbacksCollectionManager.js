/* 
	Checks if a value is undefined in a way that will work in all browsers as suggested here:
	http://stackoverflow.com/questions/7041123/test-if-something-is-not-undefined-in-javascript/17635768#17635768

	Returns true if undefined and returns false if not undefined
*/
function checkIfUndefined(value) {
    try {
        if (typeof (value) !== 'undefined') {
            return false;
        }
        else {
            return true;
        }
    }
    catch (e) {
        return true;
    }
}
/* 
    Manages callbacks dictionary with ids to different callbacks allowing to override specific previous callbacks.
    Useful for example when there is a global callbacks array which different parts of the code register callbacks to and you want different parts of code not
    to override each others callbacks however to let the specific part itself override its own callback for example on window resize event.

    New callback is identified by the uniqueCallbacksId and if the previous uniqueCallbacksId is same as new uniqueCallbacksId then the callback is overridden.
    Make sure the _callbacksIds and _callbacksList properties of the callbacks dictionary are not used outside this because they are changed here.

    Assumptions: ECMA 5+ browsers or appropriate shim for Object.keys.

    Parameters:
        existingCallbacksDictionary - An empty object {} or a dictionary created by a previous call to addCallbacksToDictionary on the empty object or on the output of addCallbacksToDictionary.
        newCallbacks                - New collection of callbacks to merge into existingCallbacksDictionary.
        uniqueCallbacksId           - Unique id associated with current new collection of callbacks. Pass same uniqueCallbacksId to override previous callbacks associated with that id.

    Example:
    var a = {};
    addCallbacksToDictionary(a, { ona: function(){alert(1);}}, "someId");
    a.ona(); // alerts 1
    addCallbacksToDictionary(a, { ona: function(){alert(2);}}, "Anotherid");
    a.ona(); // alerts 1 and then alerts 2
    addCallbacksToDictionary(a, { ona: function(){alert(3);}}, "someId");
    a.ona(); // alerts 3 and then alerts 2
    addCallbacksToDictionary(a, { ona: function(){alert(7);}}, "thirdId");
    a.ona(); // alerts 3 and then alerts 2 and then 7
    addCallbacksToDictionary(a, { ona: function(){alert(6);}}, "Anotherid");
    a.ona(); // alerts 3 and then alerts 6 and then 7
 */
function addCallbacksToDictionary(existingCallbacksDictionary, newCallbacks, uniqueCallbacksId) {
    /* Check if object is empty according to: http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object/32108184#32108184 */
    if (Object.keys(existingCallbacksDictionary).length === 0 && existingCallbacksDictionary.constructor === Object) {
        /* Don't just assign but make a clone to prevent circular reference in the callbacksList */
        /* Most efficient looping as stated here: http://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript/7252102#7252102 */
        for (var currCallbackIndex = 0, eventsName = Object.keys(newCallbacks), callbackLength = eventsName.length; currCallbackIndex < callbackLength; ++currCallbackIndex) {
            var currCallbackName = eventsName[currCallbackIndex];
            existingCallbacksDictionary[currCallbackName] = newCallbacks[currCallbackName];
        }

        existingCallbacksDictionary._callbacksIds = {};
        existingCallbacksDictionary._callbacksIds[uniqueCallbacksId] = 0;
        existingCallbacksDictionary._callbacksList = [newCallbacks];
    }
    else {
        if (!checkIfUndefined(existingCallbacksDictionary._callbacksIds[uniqueCallbacksId])) {
            /* Override previous callbacks which had same id and leave new callbacks at same priority as previous */
            existingCallbacksDictionary._callbacksList[existingCallbacksDictionary._callbacksIds[uniqueCallbacksId]] = newCallbacks;
        }
        else {
            existingCallbacksDictionary._callbacksList.push(newCallbacks);
            existingCallbacksDictionary._callbacksIds[uniqueCallbacksId] = existingCallbacksDictionary._callbacksList.length - 1;
        }

        /* Build final callbacks from the callbacks callbacksList using appropriate priorities */
        for (var currCallbackIndex = 0, eventsName = Object.keys(existingCallbacksDictionary), callbackLength = eventsName.length; currCallbackIndex < callbackLength; ++currCallbackIndex) {
            var currCallbackName = eventsName[currCallbackIndex];
            if (currCallbackName !== "_callbacksIds" && currCallbackName !== "_callbacksList") {
                delete existingCallbacksDictionary[currCallbackName];
            }
        }

        /* First calculate list of callbacks for the events and then create one callback function calling them in desired order. This is better then overloading the stack with each function calling previous function. */
        var eventsCallbacksLists = {};
        for (var currPriority = 0, maxPriority = existingCallbacksDictionary._callbacksList.length; currPriority < maxPriority; currPriority++) {
            var currCallbacksDictionary = existingCallbacksDictionary._callbacksList[currPriority];
            for (var currCallbackIndex = 0, eventsName = Object.keys(currCallbacksDictionary), callbackLength = eventsName.length; currCallbackIndex < callbackLength; ++currCallbackIndex) {
                var currCallbackName = eventsName[currCallbackIndex];
                var currCallbackValue = currCallbacksDictionary[currCallbackName];
                /* Add callback to appropriate list */
                if (eventsCallbacksLists[currCallbackName]) {
                    eventsCallbacksLists[currCallbackName].push(currCallbackValue);
                }
                else {
                    eventsCallbacksLists[currCallbackName] = [currCallbackValue];
                }
            }
        }
        for (var currCallbackIndex = 0, eventsName = Object.keys(eventsCallbacksLists), callbackLength = eventsName.length; currCallbackIndex < callbackLength; ++currCallbackIndex) {
            var currCallbackName = eventsName[currCallbackIndex];
            /* Save in closure to prevent it changing in loop */
            var currClosureCallbacksList = eventsCallbacksLists[currCallbackName];
            /* Call all callbacks in the list */
            existingCallbacksDictionary[currCallbackName] = function () {
                for (var i = 0, callbackListLength = currClosureCallbacksList.length; i < callbackListLength; ++i) {
                    currClosureCallbacksList[i]();
                }
            };
        }
    }
}
