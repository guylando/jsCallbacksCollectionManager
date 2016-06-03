# jsCallbacksCollectionManager
Think about the following situation: You have a javascript callbacks dictionary to various events where the keys are the events names and the values are the callback function to the events, and you add callbacks to this dictionary from different parts of your code.

What you probably want to happen is the following:

1)That it will be possible to add a callback to an event which has another callback function which already registered to it, while preserving the previous callback function and not overriding it and instead to add the new callback to run after the previous callback.

2)That a specific part of your code which registers a callback, will be able to override the callback he registered even if other parts of your code already registered other callbacks to the same event afterwards. When is this useful? for example when we talk about scrolling event for which a specific part of your code registered a callback already but it wants to override its callback after a window resize event happened and it also wants other parts of code not to override its callback.

I wrote a little easy to use function which deals with this situation, called addCallbacksToDictionary.

It allows to manage a collection of callbacks used from different parts of your code, using priorities and more.
Manages callbacks dictionary with ids to different callbacks allowing to override specific previous callbacks.

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

