var glob = require("glob");
var fs = require("fs");
var eslint = require("eslint").CLIEngine;
var linter = new eslint({configFile:"lint/.eslintrc", fix:true});

// We parse every js files
glob("src/client/*.js", function(err, files){
    if(err){
        return console.error(err);
    }
    var report = linter.executeOnFiles(files);
    console.log(report.results[0].messages);
    fs.writeFileSync(files[0], report.results[0].output);
});