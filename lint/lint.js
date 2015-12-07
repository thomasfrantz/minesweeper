var glob = require("glob");
var fs = require("fs");

// Configuring the linter tool
var Eslint = require("eslint").CLIEngine;
var linter = new Eslint({
    "configFile": "lint/.eslintrc",
    "fix":        false
});

// Colouring the command line
var cliColor = require("cli-color");
var errorC = cliColor.bold.red;
var warningC = cliColor.bold.yellow;
var linkC = cliColor.bold.cyan;

// We parse every js files
glob("src/client/*.js", function outputESlint(err, files){
    var i;
    var reports;

    if(err){
        return console.error(err);
    }

    files.push("lint/lint.js");
    reports = linter.executeOnFiles(files);

    for(i = 0; i < reports.results.length; i++){
        console.log(
            linkC(reports.results[ i ].filePath) + " contains :\n" +
            errorC(reports.results[ i ].errorCount + " errors") + "\n" +
            warningC(reports.results[ i ].warningCount + " warnings") + "\n\n"
        );
        if(reports.results[ 1 ].output){
            fs.writeFileSync(files[ 1 ], reports.results[ 1 ].output);
        }
    }
    //console.log(reports.results[ 1 ]);
});