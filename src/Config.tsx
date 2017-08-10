import path = require("path");
import { InvalidArgument } from "./Exceptions";
import _ = require('lodash');

export class Config {
    constructor(public jsonContent: any, public dirPath: string) {

    }
}