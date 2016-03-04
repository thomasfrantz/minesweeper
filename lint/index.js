// Colouring the command line
var cliColor = require("cli-color");
var errorC = cliColor.bold.red;
var warningC = cliColor.bold.yellow;
var linkC = cliColor.bold.cyan;
var rightC = cliColor.bold.green;

var linter = require("./lint");
var test = linter.main();

test.then(function(errors){
    if(errors){
        console.log(warningC(
                "You have to fix the " +
                errors +
                " failing files before commiting !"
        ));
    }else{
        console.log(rightC("You can commit your changes !"));
    }
}, function(e){console.log(e)});