/**<linter>
<lastLinted>12/02/2016 17:15<lastLinted>
<errorCount>0<errorCount>
<linter>**/

var glob = require("glob");
var fs = require("fs");
var eol = require("os").EOL;
var tab = "    ";
var matchTag = /\/\*\*<linter>(.|\n|\r)*<linter>\*\*\/(\n|\r)*/;

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
    var fileName;
    var textFile;
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

    if(process.argv.indexOf("-f") > 0){
        sortedFiles = initSortedFiles;
        sortedFiles.notLinted = files;
    }else{
        sortedFiles = files.reduce(sortLintedFiles, initSortedFiles);
    }

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
                report.output
            );
        }

        fileName = report.filePath;
        textFile = fs.readFileSync(fileName, "utf8");

        // Put the name of the file in the right place
        // And tag the files
        if(report.errorCount){
            sortedFiles.errorLinted.push(
                {
                    "filePath":   fileName,
                    "errorCount": report.errorCount
                }
            );
            textFile = setTag(textFile, report.errorCount, report.messages);
        }else{
            sortedFiles.rightLinted.push(fileName);
            textFile = setTag(textFile, 0);
        }

        fs.writeFileSync(fileName, textFile);
    }

    sortedFiles.rightLinted.forEach(printSuccess);
    sortedFiles.errorLinted.forEach(function anon(file){
        failCounter++;
        printError(file);
    });

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
 * getTag get the desired tag from the text of a file and returns it
 * @param  {String} textFile : The file to be parsed
 * @return {String} tag : Tag desired
 */
function getTag(textFile){
    var tag = matchTag.exec(textFile) ? matchTag.exec(textFile)[ 0 ] : "";

    return tag;
};

/**
 * setTag removes the previous tag if there was one and put a new one
 * @param {String}        textFile : The file to be tagged
 * @param {Number}        nbrErrors : Number of errors in the files
 * @param {Array<Object>} errors : Array or errors containing the rule, line and message
 * @return {String}       taggedText : Newly tagged file
 */
function setTag(textFile, nbrErrors, errors){
    var errTag;
    var date = getFormatedTime(new Date());
    var tag =
        "/**<linter>" + eol +
        "<lastLinted>" + date + "<lastLinted>" + eol +
        "<errorCount>" + nbrErrors + "<errorCount>" + eol;

    if(errors){
        errTag = "<errors>" + eol;
        errors.forEach(function anon(error){
            errTag +=
            tab + error.ruleId +
            " line " + error.line +
            " : " + error.message + eol;
        });
        errTag += "<errors>" + eol;
        tag += errTag;
    }

    tag += "<linter>" + "**/" + eol + eol;
    return tag + removeTag(textFile);
}

/**
 * removeTag removes the tag of a file
 * @param  {String} textFile : File that needs its tag to be removed
 * @return {String} tagLess : Tagless file
 */
function removeTag(textFile){
    return textFile.replace(matchTag, "");
}

/**
 * getFormatedTime returns a date to the desired format : dd/mm/yyyy:hh:mm
 * @param  {Date}   date : date non formatée
 * @return {String} formatedDate : date formatée
 */
function getFormatedTime(date){
    var round = 30;
    var roundedSec = Math.floor(date.getSeconds() / round);
    var formatedTime = setZero(date.getDate()) + "/" +
        setZero(date.getMonth() + 1) + "/" +
        date.getFullYear() + " " +
        setZero(date.getHours()) + ":" +
        setZero(date.getMinutes() + roundedSec);

    return formatedTime;
}

/**
 * setZero puts a 0 in front of a time smaller than 10, to add readability
 * @param {String}  time : Time that maybe needs to be more readable
 * @return {String} readableTime : Time that is readable for sure
 */
function setZero(time){
    var ten = 10;

    return time < ten ? "0" + time : time;
}

/**
 * sortFiles sorts the file according to whether it has been linted and passed, linted and failed or hasn't been linted yet
 * @param  {Object} filesHalfSorted : Current lists containing the sorted file names so far
 * @param  {String} fileName : file name to be sorted
 * @return {Object} filesMoreSorted : Updated lists containing the sorted file names
 */
function sortLintedFiles(filesHalfSorted, fileName){
    var filesMoreSorted = filesHalfSorted;
    var textFile = fs.readFileSync(fileName, "utf8");
    var tag = getTag(textFile) || "";
    var lastLinted = tag.split("<lastLinted>")[ 1 ] || "";
    var errorCount = tag.split("<errorCount>")[ 1 ] || "";
    var timeModified = fs.statSync(fileName).mtime;
    var lastModified = getFormatedTime(timeModified);

    // Put the file in the right list
    if(lastLinted === lastModified && errorCount){
        filesMoreSorted.errorLinted.push({
            "filePath":   fileName,
            "errorCount": errorCount
        });
    }else if(lastLinted === lastModified){
        filesMoreSorted.rightLinted.push(fileName);
    }else{
        filesMoreSorted.notLinted.push(fileName);
    }

    return filesMoreSorted;
}

/**
 * printError output an error message pointing to the faulty file and the number of errors found in it
 * @param  {Object} file : Contains the path to the failing file (link) and the number of errors in the failing file (errorCount)
 */
function printError(file){
    console.log(
        linkC(file.filePath) +
        errorC(" contains " + file.errorCount + " errors") +
        eol + eol
    );
}

/**
 * printSuccess output a message pointing to the successful file
 * @param  {String} fileName : Name of the passing file
 */
function printSuccess(fileName){
    console.log(
        linkC(fileName) +
        rightC(" passed the linter :)") +
        eol + eol
    );
}