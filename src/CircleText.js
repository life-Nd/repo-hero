"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleText = void 0;
var uniqueId_1 = require("lodash/uniqueId");
var react_1 = require("react");
var CircleText = function (_a) {
    var _b = _a.r, r = _b === void 0 ? 10 : _b, _c = _a.rotate, rotate = _c === void 0 ? 0 : _c, _d = _a.text, text = _d === void 0 ? "" : _d, props = __rest(_a, ["r", "rotate", "text"]);
    var id = (0, react_1.useMemo)(function () { return (0, uniqueId_1.default)("CircleText--"); }, []);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("path", { fill: "none", d: [
                ["M", 0, r].join(" "),
                ["A", r, r, 0, 0, 1, 0, -r].join(" "),
                ["A", r, r, 0, 0, 1, 0, r].join(" "),
            ].join(" "), id: id, transform: "rotate(".concat(rotate, ")"), style: { pointerEvents: "none" } }),
        react_1.default.createElement("text", __assign({ textAnchor: "middle" }, props),
            react_1.default.createElement("textPath", { href: "#".concat(id), startOffset: "50%" }, text))));
};
exports.CircleText = CircleText;
