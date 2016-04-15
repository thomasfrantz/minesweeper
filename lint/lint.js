/**<linter>
<lastLinted>11/03/2016 11:26<lastLinted>
<errorCount>0<errorCount>
<linter>**/

var promisify = require("es6-promisify");
var glob = promisify(require("glob"));
var fs = require("fs");
var stat = promisify(fs.stat);
var read = promisify(fs.readFile);
var write = promisify(fs.writeFile);
var eol = require("os").EOL;
var tab = "  ";
var matchTag = /\/\*\*<linter>(.|\n|\r)*<linter>\*\*\/(\n|\r)*/;

//Confi guring the linter tool
var Eslint = require("eslint").CLIEngine;
var linter = new Eslint({
  configFile: "lint/.eslintrc",
  fix: true
});
var app = "lint.js";

//Colouring the command line
var cliColor = require("cli-color");
var errorC = cliColor.bold.red;
//var warningC = cliColor.bold.yellow; NOT USED
var linkC = cliColor.bold.cyan;
var rightC = cliColor.bold.green;

/**
 * main lints all the files
 * @return {Promise<failCounter>} : Future number of non-passing files
 */
function main() {
  //We parse every js files is src
  var filesP = glob("src/**/*.js", { realpath: true });

  var failCounterP = filesP.then((files) => {
    var sortedFilesP;
    var forceSorted = {};
    var failCounter = 0;

    //Add the lint file to the lintification
    files.push("lint/lint.js");

    //If the -f option is used, every files will be linted
    if (process.argv.indexOf("-f") > 0) {
      forceSorted.notLinted = files;
      sortedFilesP = Promise.resolve(forceSorted);
    } else {
      sortedFilesP = sortFiles(files);
    }

    return sortedFilesP.then((sortedFiles) => {
      var reports = linter.executeOnFiles(sortedFiles.notLinted).results;
      var lintedFilesP = reports.map((report) => {
        var fileName = report.filePath;
        var errorCount = report.errorCount;
        var textFileP = report.output ? Promise.resolve(report.output) : read(fileName, "utf8");

        return textFileP.then((textFile) => {
          var newTextFile = "";
          if (errorCount) {
            sortedFiles.errorLinted.push(
              {
                filePath: fileName,
                errorCount: errorCount
              }
              );
            newTextFile = setTag(textFile, errorCount, report.messages);
          } else {
            sortedFiles.rightLinted.push(fileName);
            newTextFile = setTag(textFile, 0);
          }

          return write(fileName, newTextFile);
        });
      });

      return Promise.all(lintedFilesP).then(() => {
        sortedFiles.rightLinted.forEach(printSuccess);
        sortedFiles.errorLinted.forEach(printError);
        failCounter = sortedFiles.errorLinted.length;

        return Promise.resolve(failCounter);
      });
    });
  });

  return failCounterP;
}

/**
 * getTag get the desired tag from the text of a file and returns it
 * @param  {String} textFile : The file to be parsed
 * @return {String} tag : Tag desired
 */
function getTag(textFile) {
  var tag = matchTag.exec(textFile) ? matchTag.exec(textFile)[0] : "";

  return tag;
}

/**
 * setTag deletes the previous tag if there was one and put a new one
 * @param {String}        textFile : The file to be tagged
 * @param {Number}        nbrErrors : Number of errors in the files
 * @param {Array<Object>} errors : Array or errors containing the rule, line and message
 * @return {String}       taggedText : Newly tagged file
 */
function setTag(textFile, nbrErrors, errors) {
  var errTag;
  var lineDiff = getLineDiff(textFile, nbrErrors);
  var date = getFormatedTime(new Date());
  var tag =
        "/**<linter>" + eol +
        "<lastLinted>" + date + "<lastLinted>" + eol +
        "<errorCount>" + nbrErrors + "<errorCount>" + eol;

  if (errors) {
    errTag = "<errors>" + eol;
    errors.forEach(function anon(error) {
      errTag +=
            tab + error.ruleId +
            " line " + (error.line + lineDiff) +
            " : " + error.message + eol;
    });
    errTag += "<errors>" + eol;
    tag += errTag;
  }
  tag += "<linter>" + "**/" + eol + eol;

  return tag + deleteTag(textFile);
}

/**
 * deleteTag deletes the tag of a file
 * @param  {String} textFile : File that needs its tag to be deleted
 * @return {String} tagLess : Tagless file
 */
function deleteTag(textFile) {
  return textFile.replace(matchTag, "");
}

/**
 * [getLineDiff description]
 * @param  {[type]} textFile  [description]
 * @param  {[type]} nbrErrors [description]
 * @return {[type]}           [description]
 */
function getLineDiff(textFile, nbrErrors) {
  var lineNbr = 5;
  var errMarkup = 2;
  var tag = getTag(textFile);
  var oldLineNbr = tag ? tag.split(eol).length - 1 : 0;
  var newLineNbr = nbrErrors ? lineNbr + nbrErrors + errMarkup : lineNbr;

  return newLineNbr - oldLineNbr;
}

/**
 * @param  {Object} filesHalfSorted : Current lists containing the sorted file names so far
 * @param  {String} fileName : file name to be sorted
 * @return {Object} filesMoreSorted : Updated lists containing the sorted file names
 */
function sortFiles(arrayLink) {
  var sortedFiles = {
    notLinted: [],
    rightLinted: [],
    errorLinted: []
  };
  var allSortedP = arrayLink.map((link) => {
    var textFileP = read(link, "utf8");
    var statsP = stat(link);
    var sortedP = Promise.all([textFileP, statsP])
        .then((val) => {
          var textFile = val[0];
          var stats = val[1];
          updateSortedFiles(sortedFiles, link, textFile, stats);
        });

    return sortedP;
  });

  //When all the files are sorted, we return the future object where they are sorted
  return Promise.all(allSortedP).then(() => {
    return sortedFiles;
  });
}

function updateSortedFiles(sortedFiles, link, textFile, stats) {
  var tag = getTag(textFile) || "";
  var lastLinted = tag.split("<lastLinted>")[1] || "";
  var errorCount = tag.split("<errorCount>")[1] || "";
  var lastModified = getFormatedTime(stats.mtime);

  if (lastLinted === lastModified && errorCount > 0) {
    sortedFiles.errorLinted.push({
      filePath: link,
      errorCount: errorCount
    });
  } else if (lastLinted === lastModified) {
    sortedFiles.rightLinted.push(link);
  } else {
    sortedFiles.notLinted.push(link);
  }
}

/**
 * getFormatedTime returns a date to the desired format : dd/mm/yyyy:hh:mm
 * @param  {Date}   date : date non formatée
 * @return {String} formatedDate : date formatée
 */
function getFormatedTime(date) {
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
function setZero(time) {
  var ten = 10;

  return time < ten ? "0" + time : time;
}

/**
 * printError output an error message pointing to the faulty file
 * and the number of errors found in it
 * @param  {Object} file : Contains the path to the failing file (link)
 *                         and the number of errors in the failing file (errorCount)
 */
function printError(file) {
  console.log(
        linkC(file.filePath) +
        errorC(" contains " + file.errorCount + " errors") +
        eol
    );
}

/**
 * printSuccess output a message pointing to the successful file
 * @param  {String} fileName : Name of the passing file
 */
function printSuccess(fileName) {
  console.log(
        linkC(fileName) +
        rightC(" passed " + app + " :)") +
        eol
    );
}

exports.main = main;
exports.getTag = getTag;
exports.setTag = setTag;
exports.deleteTag = deleteTag;
exports.getLineDiff = getLineDiff;
exports.sortFiles = sortFiles;
exports.getFormatedTime = getFormatedTime;
exports.setZero = setZero;
exports.printError = printError;
exports.printSuccess = printSuccess;
