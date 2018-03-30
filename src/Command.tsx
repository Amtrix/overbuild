import path = require("path");
import { InvalidArgument } from "./Exceptions";
import { Parameters } from "./Parameters";

export class Command {
    private nextCommand: string;

    private executableCommand: string;

    private cwdRaw: string;

    constructor(private commandData: Parameters.QueryResult, private parameters: Parameters) {
        this.executableCommand = commandData.result;

        var argIndex;
        while ((argIndex = this.executableCommand.search(/\$\{.*\}/)) >= 0) {
            var endb = this.executableCommand.indexOf("}", argIndex);
            var part = this.executableCommand.substr(argIndex, endb - argIndex + 1);
            var domainAndValue = Command.GetDomainAndValue(part);
            this.executableCommand = 
                this.executableCommand.substr(0, argIndex) + 
                parameters.GetValueForCommandArg(domainAndValue, commandData.dirPath) + 
                this.executableCommand.substr(endb + 1);
        }

        var parts = this.executableCommand.split(/=| /);

        var chainPart = this.GetWholeParam("chain");
        this.executableCommand = this.executableCommand.replace(chainPart + "=", "");
        {
            var chainIndex = parts.indexOf(chainPart);
            if (chainIndex >= 0) {
                this.nextCommand = parts[chainIndex + 1];
                this.executableCommand = this.executableCommand.replace(parts[chainIndex + 1], "");
            }
        }

        var cwdPart = this.GetWholeParam("cwd");
        this.executableCommand = this.executableCommand.replace(cwdPart + "=", "");
        {
            var cwdIndex = parts.indexOf(cwdPart);
            if (cwdIndex >= 0) {
                this.cwdRaw = parts[cwdIndex + 1];
                this.executableCommand = this.executableCommand.replace(parts[cwdIndex + 1], "");
            } else this.cwdRaw = parameters.GetValueForCommandArg(["", "workDir"]);
        }
    }

    // Used to prefix an argument with as many dashes as needed to be like the one given in the command.
    // For example, for command "pull --cwd=xyz", GetWholeParam("cwd") return "--cwd".
    // Returns same string if neither the given string, nor any extension of it are found in the command.
    private GetWholeParam(param: string): string {
        var ret = param;
        var curr = param;
        for (var i = 0; i < 10; ++i) {
            curr = "-" + curr;
            if (this.executableCommand.indexOf(curr) >= 0)
                ret = curr;
        }
        return ret;
    }

    private static GetDomainAndValue(part: string): string[] {
        var inner = part.substr(2, part.length - 3);
        var domain = inner.substr(0, inner.indexOf("."));
        var arg = inner.substr(inner.indexOf(".") + 1);
        return [domain, arg];
    }

    private static IsArgPart(part: string) {
        return part.indexOf("${") == 0 && part[part.length - 1] == "}";
    }

    public GetExecutableCommand() { return this.executableCommand; }

    public GetNextCommand() { return this.nextCommand; }

    public GetWorkingDir(): string {
        var parts = process.platform == "win32" ? this.cwdRaw.split("\\") :  this.cwdRaw.split("/");
        var finpath = process.platform == "win32" ? "\\\\?\\" :  "/";
        
        parts.forEach(part => {
            finpath = path.join(finpath, part);
        });

        return finpath;
    }
};