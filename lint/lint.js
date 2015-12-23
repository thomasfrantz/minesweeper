/** <lastLinted>16/12/2015 16:23<lastLinted> **/
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
glob("src/**/*.js", {"realpath": true}, function outputESlint(err, files){
    var i;
    var reports;
    var report;
    var sortedFiles;
    var failCounter = 0;
    var initSortedFiles = {
        "notLinted":   [],
        "rightLinted": [],
        "errorLinted": []
    };

    if(err){
        return console.error(errorC(err));
    }

    // Add the lint file to the lintification
    files.push("lint/lint.js");

    sortedFiles = files.reduce(sortLintedFiles, initSortedFiles);

    //console.log(sortedFiles);

    reports = linter.executeOnFiles(sortedFiles.notLinted).results;

    // Display with colors
    // the number of errors for each files
    // or a nice message if lint succeeded
    for(i = 0; i < reports.length; i++){
        report = reports[ i ];

        // Fix automatically what can be fixed by the linter
        // (severity 1 in .eslintrc)
        if(report.output){
            fs.writeFileSync(
                sortedFiles.notLinted[ i ],
                reports[ i ].output
            );
        }

        // Get non fixable errors
        // and add comments at the end of faulty lines
        // (severity 2 in .eslintrc)
        if(report.errorCount){
            sortedFiles.errorLinted.push(
                {
                    "filePath":   report.filePath,
                    "errorCount": report.errorCount
                }
            );

        // If there is no errors
        // display nice message
        }else{
            sortedFiles.rightLinted.push(report.filePath);
        }
    }

    sortedFiles.rightLinted.forEach(printSuccess);
    sortedFiles.errorLinted.forEach(function anon(file){
        failCounter++;
        printError(file);
    });
    console.log(reports[ 1 ]);

    // Sum up the errors
    if(failCounter){
        console.log(warningC(
                "You have to fix the " +
                failCounter +
                " failing files before commiting !"
        ));
    }else{
        console.log(rightC("You can commit your changes !"));
    }
});

/**
 * getLine get the desired line from a file and applies a callback function to it
 * @param  {String} fileName : Name of the file to be parsed
 * @param  {Number} lineNbr  : Number of the desired line
 * @return {String} desiredLine : Line desired
 */
function getLine(fileName, lineNbr){
    var desiredLine;
    var file = fs.readFileSync(fileName, "utf8");
    var lines = file.split("\n");

    desiredLine = lines.length > lineNbr ? lines[ lineNbr - 1 ] : "";
    return desiredLine;
};

/**
 * return a date to the desired format : dd/mm/yyyy:hh:mm
 * @param  {Date}   date : date non formatée
 * @return {String} formatedDate : date formatée
 */
function getTime(date){
    var round = 30;
    var roundedSec = Math.floor(date.getSeconds() / round);
    var formatedDate = date.getDate() + "/" +
        (date.getMonth() + 1) + "/" +
        date.getFullYear() + " " +
        date.getHours() + ":" +
        (date.getMinutes() + roundedSec);

    return formatedDate;
}

/**
 * sortFiles sort the file according to whether it has been linted and passed, linted and failed or hasn't been linted yet
 * @param  {Object} filesHalfSorted : Current lists containing the sorted file names so far
 * @param  {String} file : file name to be sorted
 * @return {Object} filesHalfSorted : Updated lists containing the sorted file names
 */
function sortLintedFiles(filesHalfSorted, file){
    var filesMoreSorted = filesHalfSorted;
    var firstLine = getLine(file, 1);
    var lastLinted = firstLine.split("<lastLinted>")[ 1 ] || "";
    var errorCount = firstLine.split("<errorCount>")[ 1 ] || "";
    var timeModified = fs.statSync(file).mtime;
    var lastModified = getTime(timeModified);

    // Put the file in the right list
    if(lastLinted === lastModified && errorCount){
        filesMoreSorted.errorLinted.push({
            "filePath":   file,
            "errorCount": errorCount
        });
    }else if(lastLinted === lastModified){
        filesMoreSorted.rightLinted.push(file);
    }else{
        filesMoreSorted.notLinted.push(file);
    }

    return filesMoreSorted;
}

/**
 * It output an error message pointing to the faulty file and the number of errors found in it
 * @param  {Object} file : Contains the path to the failing file (link) and the number of errors in the failing file (errorCount)
 */
function printError(file){
    console.log(
        linkC(file.filePath) +
        errorC(" contains " + file.errorCount + " errors") +
        "\n\n"
    );
}

/**
 * It output a message pointing to the successful file
 * @param  {String} link       name of the failing file
 */
function printSuccess(link){
    console.log(
        linkC(link) +
        rightC(" passed the linter :)\n\n")
    );
}