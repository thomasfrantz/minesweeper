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
glob("src/**/*.js", function outputESlint(err, files){
    var i;
    var reports;
    var report;
    var sortedFiles;
    var rightLinted;
    var errorLinted;
    var notLinted;
    var failCounter = 0;

    if(err){
        return console.error(errorC(err));
    }

    // Add the lint file to the lintification
    files.push("lint/lint.js");

    sortedFiles = files.reduce(sortLintedFiles, null);
    rightLinted = sortedFiles.rightLinted;
    errorLinted = sortedFiles.errorLinted;
    notLinted = sortedFiles.notLinted;
    console.log(sortedFiles);

    for(i = 0; i < rightLinted.length; i++){
        console.log(
            linkC(rightLinted[ i ]) + rightC(" passed the linter :)\n\n")
        );
    }

    for(i = 0; i < errorLinted.length; i++){
        failCounter++;
        console.log(
            linkC(errorLinted[ i ].filePath) +
            errorC(" contains " + errorLinted[ i ].errorCount + " errors") +
            "\n\n"
        );
    }

    reports = linter.executeOnFiles(notLinted);

    // Display with colors
    // the number of errors for each files
    // or a nice message if lint succeeded
    for(i = 0; i < reports.results.length; i++){
        report = reports.results[ i ];

        // Fix automatically what can be fixed by the linter
        // (severity 1 in .eslintrc)
        if(report.output){
            console.log(i);
            console.log(report.output);
            fs.writeFileSync(notLinted[ i ], reports.results[ i ].output);
        }

        // Get non fixable errors
        // and add comments at the end of faulty lines
        // (severity 2 in .eslintrc)
        if(report.errorCount){
            failCounter++;
            console.log(
                linkC(report.filePath) +
                errorC(" contains " + report.errorCount + " errors") +
                "\n\n"
            );
        // If there is no errors
        // display nice message
        }else{
            console.log(
                linkC(report.filePath) + rightC(" passed the linter :)\n\n")
            );
        }
    }

    // Sum up the errors
    console.log(warningC(
            "You have to fix the " +
            failCounter +
            " failing files before commiting !"
    ));
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
    var fileMoreSorted = filesHalfSorted;
    var firstLine = getLine(file, 1);
    var lastLinted = firstLine.split("<lastLinted>")[ 1 ] || "";
    var errorCount = firstLine.split("<errorCount>")[ 1 ] || "";
    var timeModified = fs.statSync(file).mtime;
    var lastModified = getTime(timeModified);

    // Initialize filesHalfSorted
    if(filesHalfSorted === null){
        fileMoreSorted = {
            "notLinted":   [],
            "rightLinted": [],
            "errorLinted": []
        };
    }

    // Put the file in the right list
    if(lastLinted === lastModified && errorCount){
        fileMoreSorted.errorLinted.push({
            "filePath":   file,
            "errorCount": errorCount
        });
    }else if(lastLinted === lastModified){
        fileMoreSorted.rightLinted.push(file);
    }else{
        fileMoreSorted.notLinted.push(file);
    }

    return fileMoreSorted;
}