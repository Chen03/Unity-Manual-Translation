'struct mode';
const fs = require('fs');

const ign = ['node_modules', '.git', '_book'];

function getFileTitle(filePath) {
    var str = fs.readFileSync(filePath, 'utf8', 'r');
    str = str.substr(0, str.indexOf('\r'));
    var dest = str.search('[\u4e00-\u9fa5](?= )');
    if (dest != -1) return str.substr(dest + 2);
    return str.substr(2);
}

function isSumMD(dirName, filePath) {
    return dirName == getFileTitle(filePath);
}

function f2S(st, path) {
    var res = "", thi = "";
    var dir = fs.opendirSync(path);
    var dirName = path.substr(path.lastIndexOf('/') + 1);

    // console.log("Going into path:" + path + " && name:" + dirName + "\n");

    var file;
    var filePath, fileTitle, fileType;
    var fail = false;
    while ((file = dir.readSync()) != null) {
        if (file.isFile()) {
            if (file.name == 'SUMMARY.md')  continue;
            fileType = file.name.substr(file.name.indexOf('.') + 1);
            if (fileType != 'md')   continue;

            filePath = path + "/" + file.name;
            fileTitle = getFileTitle(filePath);
            thi += "  ".repeat((st - isSumMD(dirName, filePath))) + "* [" + fileTitle + "](" + filePath + ")\n";
        } else {
            fail = false;
            for (i in ign) {
                if (ign[i] == file.name) {
                    fail = true;
                    break;
                }
            }
            if (!fail)
            res += f2S(st + 1, path + "/" + file.name);
        }
    }

    return thi + res;
}

console.log(f2S(0, '.'));