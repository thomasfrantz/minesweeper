var lint = require("../lint/lint");

// Colouring the command line
var cliColor = require("cli-color");
var errorC = cliColor.bold.red;
var warningC = cliColor.bold.yellow;
var linkC = cliColor.bold.cyan;
var rightC = cliColor.bold.green;

var eol = require("os").EOL;
var tab = "    ";

var tag = "/**<linter>" + eol +
    "<lastLinted>17/02/2016 15:55<lastLinted>" + eol +
    "<errorCount>0<errorCount>" + eol +
    "<linter>**/" + eol + eol;
var txt = `TEXT`;
var tagAndTxt = tag+txt;
var nbrError = 18;
var errorTag = "/**<linter>" + eol +
    "<lastLinted>17/02/2016 15:55<lastLinted>" + eol +
    "<errorCount>18<errorCount>" + eol +
    "<errors>" + eol +
        tab + "no-unused-vars line 45 : Error" + eol +
    "<errors>" + eol +
    "<linter>**/" + eol + eol;
var error = [
    {
        "ruleId" :  "no-unused-vars",
        "line" :    "45" ,
        "message" : "Error"
    }
];

/*
test('lineDiff in lint/lint.js', function (assert){
    assert.equal(lint.getLineDiff(txt, nbrError), 7+18-0);
    assert.equal(lint.getLineDiff(errorTag + txt, 0), 5+0-8);
    assert.equal(lint.getLineDiff(tagAndTxt, 0), 0);

    assert.end();
});

test('getTag in lint/lint.js', function (assert) {
    assert.equal(lint.getTag(tag), tag);
    assert.equal(lint.getTag(txt), "");
    assert.equal(lint.getTag(tagAndTxt), tag);

    assert.end();
});

test('deleteTag in lint/lint.js', function (assert) {
    assert.equal(lint.deleteTag(tag), "");
    assert.equal(lint.deleteTag(txt), txt);
    assert.equal(lint.deleteTag(tagAndTxt), txt);

    assert.end();
});

/*
test('setTag in lint/lint.js', function (assert) {

    function setTagShould(txt, nbrError, error){
        var date = getFormatedTime(new Date());
        var tag = 
            "/**<linter>" + eol +
            "<lastLinted>" + date + "<lastLinted>" + eol +
            "<errorCount>" + nbrErrorZero + "<errorCount>" + eol;
        var errorTag = 
            "<errors>" + eol +
                tab + error.ruleId + 
                " line " + 
                ` tab + error.ruleId +
            " line " + (error.line + lineDiff) +
            " : " + error.message + eol;`
    }
    
    assert.equal(lint.setTag(txt, nbrErrorZero), tagZero+txt);
    assert.equal(lint.setTag(txt, nbrErrorZero, error), tagFour+txt);
    assert.equal(lint.setTag(txt, nbrErrorFour), tagZero+txt);
    assert.equal(lint.setTag(txt, nbrErrorFour, error), tagFour+txt);


    assert.end();
});*/