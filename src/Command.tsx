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

        this.executableCommand = this.executableCommand.replace("-chain=", "");
        {
            var chainIndex = parts.indexOf("-chain");
            if (chainIndex >= 0) {
                this.nextCommand = parts[chainIndex + 1];
                this.executableCommand = this.executableCommand.replace(parts[chainIndex + 1], "");
            }
        }

        this.executableCommand = this.executableCommand.replace("-cwd=", "");
        {
            var cwdIndex = parts.indexOf("-cwd");
            if (cwdIndex >= 0) {
                this.cwdRaw = parts[cwdIndex + 1];
                this.executableCommand = this.executableCommand.replace(parts[cwdIndex + 1], "");
            } else this.cwdRaw = parameters.GetValueForCommandArg(["", "workDir"]);
        }
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
        var parts = this.cwdRaw.split("/");
        var finpath = "/";
        parts.forEach(part => {
            finpath = path.join(finpath, part);
        });

        return finpath;
    }
};