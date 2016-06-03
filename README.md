# jsCallbacksCollectionManager
Allows to manage a collection of callbacks used from different parts of your code, using priorities and more.
Manages callbacks dictionary with ids to different callbacks allowing to override specific previous callbacks.
Useful for example when there is a global callbacks array which different parts of the code register callbacks to and you want different parts of code not
to override each others callbacks however to let the specific part itself override its own callback for example on window resize event.

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

