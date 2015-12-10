/**Erase this line when linting is finished**/
var glob = require("glob");
var fs = require("fs");

// Configuring the linter tool
var Eslint = require("eslint").CLIEngine;
var linter = new Eslint({
    "configFile": "lint/.eslintrc",
    "fix":        true
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
    var report;
    var linted = "/**Erase this line when linting is finished**/";

    if(err){
        return console.error(errorC(err));
    }

    // Add the lint file to be lintification
    files.push("lint/lint.js");
    reports = linter.executeOnFiles(files);

    for(i = 0; i < reports.results.length; i++){
        report = reports.results[ i ];

        // Display with colors the number of errors and warnings for each files
        console.log(
            linkC(report.filePath) + " contains :\n" +
            errorC(report.errorCount + " errors") + "\n\n"
        );

        // Fix automatically what can be fixed by the linter
        // (severity 1 in .eslintrc)
        if(report.output){
            fs.writeFileSync(files[ i ], reports.results[ i ].output);
        }

        // Get non fixable errors and add comments at the end of faulty lines
        // (severity 2 in .eslintrc)
    }
    console.log(warningC("You have to fix those errors before commiting !"));
    console.log(reports.results[ 1 ]);
});