var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;

var a = 4;

var t = assert.eventually.equal(Promise.resolve(2 + 2), 5, "This had better be true, eventually");
t.then(function(val){console.log(t)});
console.log(assert.isFulfilled(t, "yolo").then(function(val){console.log(val)}));
function isPromise(func){
    return func !== null 
        && ( typeof func === "object" || typeof func === "function" ) 
        && typeof func.then === "function";
}

function object2array (obj){
    var arr = [];
    for(var prop in obj){
        if(obj.hasOwnProperty(prop)){
            arr.push(obj[prop]);
        }
    }
    return arr;
}

function tester (name){

    var name = name || "function from file.js" ;
    var tests = {};

/*** @TODO
ATTENTION FUTUR MOI : TESTS DOIT ETRE UN OBJET, POUR POUVOIR LEUR DONNER DES NOMS. 
//IL FAUT FAIRE UN CONVERTISSEUR OBJET => ARRAY 
IL FAUT FAIRE LA METHODE REMOVE
METTRE ISPROMISE ET TOARRAY DANS UN FICHIER UTIL
CHAI_AS_PROMISE
**/

    return {
        "register" : function(name, test){
            var isP = isPromise(test);


            if ( isP && name){
                tests[name]= test;
            }else if(!isP){
                console.log(name + " n'est pas un objet Promise");
            }else{
                console.log("Le nom doit être un String non vide");
            }
        },
        "remove" : function(name){
            delete tests[name];
        },
        "run" : function(names){

            /*
            var resP = new Promise(function(resolve, reject){
                tests.forEach(function(test, i){
                    results[i] = test.then(function(val){return val});
                });
                resolve();
            });
            resP.then(function(){console.log(tests, results)});*/
            console.log(object2array(tests));
        }
    }
};
/*
var tests1 = tester();
var test1 = "pasPromise";
var test2 = new Promise( function(resolve, reject){
    resolve("Promise1");
});
var test3 = new Promise( function(resolve, reject){
    resolve("Promise2");
});

tests1.register("test1", test1);
tests1.register("test2", test2);
tests1.register("test3", test3);
tests1.run();*/