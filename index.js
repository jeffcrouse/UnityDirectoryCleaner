const rmfr = require('rmfr');
var fs = require('fs');
var path = require('path');

function regExpEscape (s) {
    return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
function wildcardToRegExp (s) {
    return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

const whitelist = [
    "Assets", "ProjectSettings", "Packages", "CHANGELOG.md",
    "UnityPackageManager", "README.md", ".git*", "*.unitypackage",
    "LICENSE*", ".collabignore", "*.sh", '*.keystore', "*.pdf",
    "iOSBuild"
].map( p => wildcardToRegExp(p) );

const blacklist = [
    "*.sln", "*.csproj", "Logs", "obj", "Library", 
    "*.DS_Store", ".vs", "*.userprefs", "Build*", ".vscode",
    "QCAR", "Temp", "*.dll", "*.ini"
].map( p => wildcardToRegExp(p) );


function arraymatch(file, array) {
    let isMatch = false;
    array.forEach( re => {
        if(file.match(re)) isMatch = true;
    });
    return isMatch;
}

// -----------------------------------------
async function CleanProject(dir) {
    try  {
        let files = await fs.promises.readdir(dir);
        files.forEach( async(file) =>  {
            const fullpath = path.join(dir, file);
            if(arraymatch(file, whitelist)) 
                return; // console.log("WHITELISTED", file)
            if(arraymatch(file, blacklist))
                return rmfr(fullpath);
            console.log("!!! UNKNOWN", fullpath, "Skipping...");
        });
    } catch(e) {
        console.error(`Couldn't read ${dir}. Skipping.`);
    }
}

// -----------------------------------------
async function CleanDirs() {
    try {
        let root = process.argv[2];
        let folders = await fs.promises.readdir(root);
        folders.forEach( async (project_dir) => await CleanProject(path.join(root, project_dir)) );
    } catch(e) {
        console.error("Couldn't read root directory!")
    }
}


if (require.main === module) {
    CleanDirs();
}