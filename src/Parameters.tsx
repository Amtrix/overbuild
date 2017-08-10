import path = require("path");
import _ = require('lodash');
import { InvalidArgument } from "./Exceptions";
import { Config } from "./Config";

export class Parameters {
    // Configs, sorted from the directory overbuild was executed in to the topmost config file.
    private configs: Config[] = [];

    constructor(configDirs: string[],
                args: any,
                unknownArgs: any) {

        this.configs.push(new Config(args, "./"));
        this.configs.push(new Config(unknownArgs, "./"));

        configDirs.forEach(configDir => {
            this.configs.push(new Config(
                require(path.join(configDir, "/overbuild.json")),
                configDir
            ));
        });
    }

    private GetProjectConfigWithinProjects(config: any, project: string): any {
        if (!config || !config.projects || !project)
            return null;

        var ret = null;
        config.projects.forEach((project: any) => {
            if (project.key == project)
                ret = project;
        });

        return ret;
    }

    // Take a string of form "a.b.c.d" and see if the arguments or a config from bottom
    // to top in the chain contains it.
    public QueryForArgument(argpath: string): Parameters.QueryResult {
        var value: Parameters.QueryResult = null;
        this.configs.forEach((config) => {
            // Skip further checks
            if (value && value.result) return;

            var content = _.get(config.jsonContent, argpath);
            value = new Parameters.QueryResult(content, config.dirPath);
            if (value.result) return;
        });
        return value;
    }

    public GetRootDirectory() {
        return this.configs[this.configs.length - 1].dirPath;
    }

    public GetExecutionCommandForCommand(cmd: string): Parameters.QueryResult {
        var execCmd = this.QueryForArgument("commands." + cmd);

        if (execCmd) return execCmd;
    }

    public GetValueForCommandArg(domainAndValue: string[], dirOfCommand: string = null): string {
        if (domainAndValue[0] == 'args') return this.QueryForArgument(domainAndValue[1]).result;
        else if (domainAndValue[1] == 'rootDir') return this.GetRootDirectory();
        else if (domainAndValue[1] == 'thisDir') return dirOfCommand;
        else if (domainAndValue[1] == 'workDir') return process.cwd();
        return "[undefined]";
    }
};

export namespace Parameters {
    export class QueryResult {
        constructor (public result: any, public dirPath: string) {
        }
    }
}