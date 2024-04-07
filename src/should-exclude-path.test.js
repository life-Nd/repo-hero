"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var should_exclude_path_1 = require("./should-exclude-path");
describe("shouldExcludePath", function () {
    it("excludes based on folder or perfect match relative to root", function () {
        var excludePaths = new Set([
            'node_modules/',
            'yarn.lock'
        ]);
        var excludeGlobs = [];
        var testShouldExcludePath = function (path) { return (0, should_exclude_path_1.shouldExcludePath)(path, excludePaths, excludeGlobs); };
        expect(testShouldExcludePath('node_modules/')).toEqual(true);
        expect(testShouldExcludePath('yarn.lock')).toEqual(true);
        // Non-matched files work
        expect(testShouldExcludePath('src/app.js')).toEqual(false);
        expect(testShouldExcludePath('src/yarn.lock')).toEqual(false);
    });
    it("excludes based on micromatch globs", function () {
        var excludePaths = new Set();
        var excludeGlobs = [
            'node_modules/**',
            '**/yarn.lock',
            '**/*.png',
            '**/!(*.module).ts' // Negation:  block non-module files, not regular ones
        ];
        var testShouldExcludePath = function (path) { return (0, should_exclude_path_1.shouldExcludePath)(path, excludePaths, excludeGlobs); };
        expect(testShouldExcludePath('node_modules/jest/index.js')).toEqual(true);
        expect(testShouldExcludePath('node_modules/jest')).toEqual(true);
        // Block all nested lockfiles
        expect(testShouldExcludePath('yarn.lock')).toEqual(true);
        expect(testShouldExcludePath('subpackage/yarn.lock')).toEqual(true);
        // Block by file extension
        expect(testShouldExcludePath('src/docs/boo.png')).toEqual(true);
        expect(testShouldExcludePath('test/boo.png')).toEqual(true);
        expect(testShouldExcludePath('boo.png')).toEqual(true);
        // Block TS files unless they are modules
        expect(testShouldExcludePath('index.ts')).toEqual(true);
        expect(testShouldExcludePath('index.module.ts')).toEqual(false);
        // Regular files work
        expect(testShouldExcludePath('src/index.js')).toEqual(false);
    });
});
