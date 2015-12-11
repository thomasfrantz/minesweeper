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
var rightC = cliColor.bold.green;

// We parse every js files
glob("src/**/*.js", function outputESlint(err, files){
    var i;
    var reports;
    var report;

    var sortedFiles = files.reduce(
        sortFiles,
        {
            
        }
    );
    
    //console.log(sortedFiles);
});

    //var linted = "/**Erase this line when linting is finished**/";
    /*
    if(err){
        return console.error(errorC(err));
    }


    // Add the lint file to be lintification
    files.push("lint/lint.js");
    reports = linter.executeOnFiles(files);

    for(i = 0; i < reports.results.length; i++){
        report = reports.results[ i ];

        if(report.errorCount){
            // Display with colors
            // the number of errors and warnings for each files
            console.log(
                linkC(report.filePath) + " contains :\n" +
                errorC(report.errorCount + " errors") + "\n\n"
            );

            // Fix automatically what can be fixed by the linter
            // (severity 1 in .eslintrc)
            if(report.output){
                fs.writeFileSync(files[ i ], reports.results[ i ].output);
            }

            // Get non fixable errors
            // and add comments at the end of faulty lines
            // (severity 2 in .eslintrc)
        }else{
            console.log(
                linkC(report.filePath) + rightC(" passed the linter :)\n\n")
            );
        }
    }
    console.log(warningC("You have to fix those errors before commiting !"));
    //console.log(reports.results[ 0 ]);
    console.log(reports.results[ 1 ]);
    getLine("fileName", "lineNbr", "callback");
}); 
*/

/**
 * getLine get the desired line from a file and applies a callback function to it
 * @param  {String}   fileName : Name of the file to be parsed
 * @param  {Number}   lineNbr  : Number of the desired line
 * @param  {Function} callback : Function that will use the desired line as an argument
 */
function getLine(fileName, lineNbr, callback){
    if(fileName == "src/client/nineSquares.js"){
        return "desiredLineIsRight";
    }else{
        return "desiredLineIsWrong";
    }
    
};

/**
 * sortFiles sort the file
 * @param  {[type]} filesBeingSorted [description]
 * @param  {[type]} file             [description]
 * @return {[type]}                  [description]
 */
function sortFiles(filesBeingSorted, file){
    var lastLinted = getLine(file, 1);
    var lastModified = "desiredLineIsRight";
        /*
    if(lastLinted == lastModified){
        filesBeingSorted.linted.push(file);
    }else{
        filesBeingSorted.notLinted.push(file);
    }*/
    console.log(filesBeingSorted);
    if(!filesBeingSorted){
        filesBeingSorted = {"rest":"yo"};
        console.log("test");
    }
    console.log(filesBeingSorted);
    return filesBeingSorted;
}