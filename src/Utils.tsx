import colors = require("colors");
import path = require("path");

export function FormattedOutput(error: any, stdout: any, stderr: any)
{
    if (error) {
        console.error(colors.yellow(`overbuild-error:`));
        console.error(`${error}`);
    }
    if (stdout) {
        console.log(colors.yellow(`stdout:`));
        console.log(`${stdout}`);
    }
    if (stderr) {
        console.error(colors.yellow(`stderr:`));
        console.log(`${stderr}`);
    }

    if (!error && !stdout && !stderr)
        console.log("No output.");
}

export function GetDirectoriesWithConfig(): string[]
{
    var curr = process.cwd();
    var wentUp = false;
    var configs = [];
    do {
        var overbuildPath = path.join(curr, "/overbuild.json");
        var success = true;
        
        try {
            var config = require(overbuildPath);
        } catch (e) {
            success = false;
        }

        if (success)
            configs.push(curr);

        var before = curr;
        curr = path.join(curr, "../");
        wentUp = before != curr;
    } while (wentUp)

    return configs;
}