var fs = require('fs');
var path = require('path');
function copyFileSync(source, target) {

    var targetFile = target;
    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
            // var str = targetFile;
            // if (!str.match("map")) {
            //     // str = str.replace("..\\Assets\\Assets\\ts\\", "");
            //     str = str.replace("..\\", "");
            //     // str = str.replace(".txt", "");
            //     str = str.replace("\\", "/");
            //     str = str.replace("\\", "/");
            //     str = str.replace("\\", "/");
            //     str = str.replace("\\", "/");
            //     str = str.replace("\\", "/");
            //     str = str.replace("\\", "/");
            //     sumStr += str + "|";
            // }
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, targetFolder) {
    var files = [];

    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);

            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, path.join(targetFolder, file));
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

if (process.argv.length == 5) {
    if (process.argv[2] == 1) {
        //复制文件夹
        copyFolderRecursiveSync(process.argv[3], process.argv[4]);
    } else if (process.argv[2] == 0) {
        //复制单个文件
        copyFileSync(process.argv[3], process.argv[4]);
    } else {
        console.error('第二个参数非法 argv[2]');
    }

    // sumStr = sumStr.substring(0, sumStr.length - 1);
    // fs.writeFileSync("..\\Assets\\Assets\\ts\\ScriptName.txt", sumStr);
    // console.log(sumStr);
} else {
    console.error('参数数量不对');
}