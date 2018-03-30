import path = require("path");
import ArgumentParserNamespace = require("argparse");
import util = require("util");
import child_process = require("child_process");
import colors = require("colors");
import { Parameters } from "./Parameters";
import { Command } from "./Command";
import { FormattedOutput, GetDirectoriesWithConfig } from "./Utils";
import * as extend from "extend";

var spawnargs = require('spawn-args');
let spawnSync = child_process.spawnSync;
let spawn = child_process.spawn;
let exec = child_process.exec;
let ArgumentParser = ArgumentParserNamespace.ArgumentParser;

let configfile = path.join(process.cwd(), "overbuild.json");

var args, unknownArgs: any;
{
    var parser = new ArgumentParser({
        version: '0.0.1',
        addHelp: true,
        description: 'Build tool for cross-project management.'
    });

    parser.addArgument(
        ['command'],
        {
            help: "The command to execute on the project."
        }
    );

    var tmp = parser.parseKnownArgs();
    args = tmp[0];
    var unknownArgsArr = tmp[1];

    unknownArgs = {};
    for (var i = 0; i < unknownArgsArr.length; ++i) {
        var elem = unknownArgsArr[i];
        while (elem[0] == '-') elem = elem.replace("-", "");

        if (elem.indexOf("=") == -1) {
            unknownArgs[elem] = unknownArgsArr[i+1];
            i++;
        } else {
            var parts = elem.split("=");
            unknownArgs[parts[0]] = parts[1];
        }
    }
}

var parameters = new Parameters(
        GetDirectoriesWithConfig(),
        args,
        unknownArgs);

console.log(colors.cyan(`Project: ${args.project}`));
console.log(colors.cyan(`Command: ${args.command}`));

var commandData = parameters.GetExecutionCommandForCommand(parameters.QueryForArgument('command').result);

if (!commandData) {
    throw Error("Command not recognized. Exit.");
}

function ExecuteCommand(commandData: Parameters.QueryResult) {
    if (!commandData) return;
    
    var command = new Command(commandData, parameters);
    var execCmd = command.GetExecutableCommand();
    var cmdpart = execCmd.substr(0, execCmd.indexOf(' '));
    // If a command is a path, we use double quotes to possibly identify it.
    if (execCmd[0] == "\"") cmdpart = execCmd.substr(1, execCmd.substr(1).indexOf("\""));
    var argpart = execCmd.substr(cmdpart.length + 1);
    var args = spawnargs(argpart);
    var noquoteargs: string[] = [];
    args.forEach((arg: string) => {
        if (arg[0] == "\'" && arg[arg.length-1] == "\'") noquoteargs.push(arg.substr(1, arg.length - 2));
        else if (arg[0] == "\"" && arg[arg.length-1] == "\"") noquoteargs.push(arg.substr(1, arg.length - 2));
        else noquoteargs.push(arg);
    });

    console.log(colors.cyan(`Command-content:         ${commandData.result}`));
    console.log(colors.cyan(`Parsed-command-content:  ${command.GetExecutableCommand()}`));
    console.log(colors.cyan(`Identified command part: '${cmdpart}'`));
    console.log(colors.cyan(`Execute in directory:    ${command.GetWorkingDir()}`));
    console.log(colors.cyan(`Parsed args:             ${noquoteargs}`));
 
    //try {
    const child = spawn(cmdpart, noquoteargs, {cwd: command.GetWorkingDir(), stdio: 'inherit'});

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}, next cmd: ${command.GetNextCommand()}`);
        if (command.GetNextCommand()) {
            console.log('---------------');
            ExecuteCommand(parameters.GetExecutionCommandForCommand(command.GetNextCommand()));
        }
    });
    //} catch (err) {
    //    console.log(err);
    //}
}

process.on('uncaughtException', function (err) {
    console.error(err);
  });

ExecuteCommand(commandData);