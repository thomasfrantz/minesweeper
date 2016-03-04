function isPromise(func){
    return func !== null 
        && ( typeof func === "object" || typeof func === "function" ) 
        && typeof func.then === "function";
}

var tester = function(name){
    var name = name || "tester" ;
    var tests = [];

    return {
        "register" : function(test){
            if (isPromise(test)){
                tests.push(test);
            }else{
                console.log(test + " n'est pas un objet Promise");
            }
        },
        "run" :      function(){
            var resP = new Promise(function(resolve, reject){
                tests.forEach(function(test, i){
                    results[i] = test.then(function(val){return val});
                });
                resolve();
            });
            resP.then(function(){console.log(tests, results)});
        }
    }
};

var tests1 = tester();
var test1 = "pasPromise";
var test2 = new Promise( function(resolve, reject){
    resolve("Promise1");
});
var test3 = new Promise( function(resolve, reject){
    resolve("Promise2");
});

tests1.register(test1);
tests1.register(test2);
tests1.register(test3);
tests1.run();