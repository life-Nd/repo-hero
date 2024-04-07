"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldExcludePath = void 0;
var micromatch_1 = require("micromatch");
/**
 * True if path is excluded by either the path or glob criteria.
 * path may be to a directory or individual file.
 */
var shouldExcludePath = function (path, pathsToIgnore, globsToIgnore) {
    if (!path)
        return false;
    return (pathsToIgnore.has(path) ||
        globsToIgnore.some(function (glob) {
            return glob &&
                (0, micromatch_1.isMatch)(processPath(path), glob, {
                    dot: true,
                });
        }));
};
exports.shouldExcludePath = shouldExcludePath;
var processPath = function (path) {
    if (path.startsWith("./"))
        return path.substring(2);
    return path;
};
