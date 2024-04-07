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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = void 0;
var react_1 = require("react");
var d3_1 = require("d3");
var countBy_1 = require("lodash/countBy");
var maxBy_1 = require("lodash/maxBy");
var entries_1 = require("lodash/entries");
var uniqBy_1 = require("lodash/uniqBy");
var flatten_1 = require("lodash/flatten");
// file colors are from the github/linguist repo
var language_colors_json_1 = require("./language-colors.json");
var CircleText_1 = require("./CircleText");
var utils_1 = require("./utils");
var looseFilesId = "__structure_loose_file__";
var width = 1000;
var height = 1000;
var maxChildren = 9000;
var lastCommitAccessor = function (d) { var _a, _b; return new Date(((_b = (_a = d.commits) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.date) + "0"); };
var numberOfCommitsAccessor = function (d) { var _a; return ((_a = d === null || d === void 0 ? void 0 : d.commits) === null || _a === void 0 ? void 0 : _a.length) || 0; };
var Tree = function (_a) {
    var data = _a.data, _b = _a.filesChanged, filesChanged = _b === void 0 ? [] : _b, _c = _a.maxDepth, maxDepth = _c === void 0 ? 9 : _c, _d = _a.colorEncoding, colorEncoding = _d === void 0 ? "type" : _d, customFileColors = _a.customFileColors;
    var fileColors = __assign(__assign({}, language_colors_json_1.default), customFileColors);
    var _e = (0, react_1.useState)(null), selectedNodeId = _e[0], setSelectedNodeId = _e[1];
    var cachedPositions = (0, react_1.useRef)({});
    var cachedOrders = (0, react_1.useRef)({});
    var _f = (0, react_1.useMemo)(function () {
        if (!data)
            return { colorScale: function () { }, colorExtent: [0, 0] };
        var flattenTree = function (d) {
            return d.children ? (0, flatten_1.default)(d.children.map(flattenTree)) : d;
        };
        var items = flattenTree(data);
        // @ts-ignore
        var flatTree = colorEncoding === "last-change"
            ? items.map(lastCommitAccessor).sort(function (a, b) { return b - a; }).slice(0, -8)
            : items.map(numberOfCommitsAccessor).sort(function (a, b) { return b - a; }).slice(2, -2);
        var colorExtent = (0, d3_1.extent)(flatTree);
        // const valueScale = scaleLog()
        //   .domain(colorExtent)
        //   .range([0, 1])
        //   .clamp(true);
        // const colorScale = scaleSequential((d) => interpolateBuPu(valueScale(d)));
        var colors = [
            "#f4f4f4",
            "#f4f4f4",
            "#f4f4f4",
            // @ts-ignore
            colorEncoding === "last-change" ? "#C7ECEE" : "#FEEAA7",
            // @ts-ignore
            colorEncoding === "number-of-changes" ? "#3C40C6" : "#823471",
        ];
        var colorScale = (0, d3_1.scaleLinear)()
            .domain((0, d3_1.range)(0, colors.length).map(function (i) { return (+colorExtent[0] +
            (colorExtent[1] - colorExtent[0]) * i / (colors.length - 1)); }))
            .range(colors).clamp(true);
        return { colorScale: colorScale, colorExtent: colorExtent };
    }, [data]), colorScale = _f.colorScale, colorExtent = _f.colorExtent;
    var getColor = function (d) {
        var _a;
        if (colorEncoding === "type") {
            var isParent = d.children;
            if (isParent) {
                var extensions = (0, countBy_1.default)(d.children, function (c) { return c.extension; });
                var mainExtension = (_a = (0, maxBy_1.default)((0, entries_1.default)(extensions), function (_a) {
                    var k = _a[0], v = _a[1];
                    return v;
                })) === null || _a === void 0 ? void 0 : _a[0];
                return fileColors[mainExtension] || "#CED6E0";
            }
            return fileColors[d.extension] || "#CED6E0";
        }
        else if (colorEncoding === "number-of-changes") {
            return colorScale(numberOfCommitsAccessor(d)) || "#f4f4f4";
        }
        else if (colorEncoding === "last-change") {
            return colorScale(lastCommitAccessor(d)) || "#f4f4f4";
        }
    };
    var packedData = (0, react_1.useMemo)(function () {
        if (!data)
            return [];
        var hierarchicalData = (0, d3_1.hierarchy)(processChild(data, getColor, cachedOrders.current, 0, fileColors)).sum(function (d) { return d.value; })
            .sort(function (a, b) {
            if (b.data.path.startsWith("src/fonts")) {
                //   a.data.sortOrder,
                //   b.data.sortOrder,
                //   (b.data.sortOrder - a.data.sortOrder) ||
                //     (b.data.name > a.data.name ? 1 : -1),
                //   a,
                //   b,
                // );
            }
            return (b.data.sortOrder - a.data.sortOrder) ||
                (b.data.name > a.data.name ? 1 : -1);
        });
        var packedTree = (0, d3_1.pack)()
            .size([width, height * 1.3]) // we'll reflow the tree to be more horizontal, but we want larger bubbles (.pack() sizes the bubbles to fit the space)
            .padding(function (d) {
            if (d.depth <= 0)
                return 0;
            var hasChildWithNoChildren = d.children.filter(function (d) { var _a; return !((_a = d.children) === null || _a === void 0 ? void 0 : _a.length); }).length > 1;
            if (hasChildWithNoChildren)
                return 5;
            return 13;
            // const hasChildren = !!d.children?.find((d) => d?.children?.length);
            // return hasChildren ? 60 : 8;
            // return [60, 20, 12][d.depth] || 5;
        })(hierarchicalData);
        packedTree.children = reflowSiblings(packedTree.children, cachedPositions.current, maxDepth);
        var children = packedTree.descendants();
        cachedOrders.current = {};
        cachedPositions.current = {};
        var saveCachedPositionForItem = function (item) {
            cachedOrders.current[item.data.path] = item.data.sortOrder;
            if (item.children) {
                item.children.forEach(saveCachedPositionForItem);
            }
        };
        saveCachedPositionForItem(packedTree);
        children.forEach(function (d) {
            cachedPositions.current[d.data.path] = [d.x, d.y];
        });
        return children.slice(0, maxChildren);
    }, [data, fileColors]);
    var selectedNode = selectedNodeId &&
        packedData.find(function (d) { return d.data.path === selectedNodeId; });
    var fileTypes = (0, uniqBy_1.default)(packedData.map(function (d) { return fileColors[d.data.extension] && d.data.extension; })).sort().filter(Boolean);
    return (react_1.default.createElement("svg", { width: width, height: height, style: {
            background: "white",
            fontFamily: "sans-serif",
            overflow: "visible",
        }, xmlns: "http://www.w3.org/2000/svg" },
        react_1.default.createElement("defs", null,
            react_1.default.createElement("filter", { id: "glow", x: "-50%", y: "-50%", width: "200%", height: "200%" },
                react_1.default.createElement("feGaussianBlur", { stdDeviation: "4", result: "coloredBlur" }),
                react_1.default.createElement("feMerge", null,
                    react_1.default.createElement("feMergeNode", { in: "coloredBlur" }),
                    react_1.default.createElement("feMergeNode", { in: "SourceGraphic" })))),
        packedData.map(function (_a) {
            var x = _a.x, y = _a.y, r = _a.r, depth = _a.depth, data = _a.data, children = _a.children, d = __rest(_a, ["x", "y", "r", "depth", "data", "children"]);
            if (depth <= 0)
                return null;
            if (depth > maxDepth)
                return null;
            var isOutOfDepth = depth >= maxDepth;
            var isParent = !!children;
            var runningR = r;
            // if (depth <= 1 && !children) runningR *= 3;
            if (data.path === looseFilesId)
                return null;
            var isHighlighted = filesChanged.includes(data.path);
            var doHighlight = !!filesChanged.length;
            return (react_1.default.createElement("g", { key: data.path, style: {
                    fill: doHighlight
                        ? isHighlighted ? "#FCE68A" : "#ECEAEB"
                        : data.color,
                    transition: "transform ".concat(isHighlighted ? "0.5s" : "0s", " ease-out, fill 0.1s ease-out"),
                    // opacity: doHighlight && !isHighlighted ? 0.6 : 1,
                }, transform: "translate(".concat(x, ", ").concat(y, ")") }, isParent
                ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("circle", { r: r, style: { transition: "all 0.5s ease-out" }, stroke: "#290819", strokeOpacity: "0.2", strokeWidth: "1", fill: "white" })))
                : (react_1.default.createElement("circle", { style: {
                        filter: isHighlighted ? "url(#glow)" : undefined,
                        transition: "all 0.5s ease-out",
                    }, r: runningR, strokeWidth: selectedNodeId === data.path ? 3 : 0, stroke: "#374151" }))));
        }),
        packedData.map(function (_a) {
            var x = _a.x, y = _a.y, r = _a.r, depth = _a.depth, data = _a.data, children = _a.children;
            if (depth <= 0)
                return null;
            if (depth > maxDepth)
                return null;
            var isParent = !!children && depth !== maxDepth;
            if (!isParent)
                return null;
            if (data.path === looseFilesId)
                return null;
            if (r < 16 && selectedNodeId !== data.path)
                return null;
            if (data.label.length > r * 0.5)
                return null;
            var label = (0, utils_1.truncateString)(data.label, r < 30 ? Math.floor(r / 2.7) + 3 : 100);
            var offsetR = r + 12 - depth * 4;
            var fontSize = 16 - depth;
            return (react_1.default.createElement("g", { key: data.path, style: { pointerEvents: "none", transition: "all 0.5s ease-out" }, transform: "translate(".concat(x, ", ").concat(y, ")") },
                react_1.default.createElement(CircleText_1.CircleText, { style: { fontSize: fontSize, transition: "all 0.5s ease-out" }, r: Math.max(20, offsetR - 3), fill: "#374151", stroke: "white", strokeWidth: "6", rotate: depth * 1 - 0, text: label }),
                react_1.default.createElement(CircleText_1.CircleText, { style: { fontSize: fontSize, transition: "all 0.5s ease-out" }, fill: "#374151", rotate: depth * 1 - 0, r: Math.max(20, offsetR - 3), text: label })));
        }),
        packedData.map(function (_a) {
            var x = _a.x, y = _a.y, r = _a.r, depth = _a.depth, data = _a.data, children = _a.children;
            if (depth <= 0)
                return null;
            if (depth > maxDepth)
                return null;
            var isParent = !!children;
            // if (depth <= 1 && !children) runningR *= 3;
            if (data.path === looseFilesId)
                return null;
            var isHighlighted = filesChanged.includes(data.path);
            var doHighlight = !!filesChanged.length;
            if (isParent && !isHighlighted)
                return null;
            if (selectedNodeId === data.path && !isHighlighted)
                return null;
            if (!(isHighlighted ||
                (!doHighlight && !selectedNode) && r > 22)) {
                return null;
            }
            var label = isHighlighted
                ? data.label
                : (0, utils_1.truncateString)(data.label, Math.floor(r / 4) + 3);
            return (react_1.default.createElement("g", { key: data.path, style: {
                    fill: doHighlight
                        ? isHighlighted ? "#FCE68A" : "#29081916"
                        : data.color,
                    transition: "transform ".concat(isHighlighted ? "0.5s" : "0s", " ease-out"),
                }, transform: "translate(".concat(x, ", ").concat(y, ")") },
                react_1.default.createElement("text", { style: {
                        pointerEvents: "none",
                        opacity: 0.9,
                        fontSize: "14px",
                        fontWeight: 500,
                        transition: "all 0.5s ease-out",
                    }, fill: "#4B5563", textAnchor: "middle", dominantBaseline: "middle", stroke: "white", strokeWidth: "3", strokeLinejoin: "round" }, label),
                react_1.default.createElement("text", { style: {
                        pointerEvents: "none",
                        opacity: 1,
                        fontSize: "14px",
                        fontWeight: 500,
                        transition: "all 0.5s ease-out",
                    }, textAnchor: "middle", dominantBaseline: "middle" }, label),
                react_1.default.createElement("text", { style: {
                        pointerEvents: "none",
                        opacity: 0.9,
                        fontSize: "14px",
                        fontWeight: 500,
                        mixBlendMode: "color-burn",
                        transition: "all 0.5s ease-out",
                    }, fill: "#110101", textAnchor: "middle", dominantBaseline: "middle" }, label)));
        }),
        !filesChanged.length && colorEncoding === "type" &&
            react_1.default.createElement(Legend, { fileTypes: fileTypes, fileColors: fileColors }),
        !filesChanged.length && colorEncoding !== "type" &&
            react_1.default.createElement(ColorLegend, { scale: colorScale, extent: colorExtent, colorEncoding: colorEncoding })));
};
exports.Tree = Tree;
var formatD = function (d) { return (typeof d === "number" ? d : (0, d3_1.timeFormat)("%b %Y")(d)); };
var ColorLegend = function (_a) {
    var scale = _a.scale, extent = _a.extent, colorEncoding = _a.colorEncoding;
    if (!scale || !scale.ticks)
        return null;
    var ticks = scale.ticks(10);
    return (react_1.default.createElement("g", { transform: "translate(".concat(width - 160, ", ").concat(height - 90, ")") },
        react_1.default.createElement("text", { x: 50, y: "-5", fontSize: "10", textAnchor: "middle" }, colorEncoding === "number-of-changes" ? "Number of changes" : "Last change date"),
        react_1.default.createElement("linearGradient", { id: "gradient" }, ticks.map(function (tick, i) {
            var color = scale(tick);
            return (react_1.default.createElement("stop", { offset: i / (ticks.length - 1), stopColor: color, key: i }));
        })),
        react_1.default.createElement("rect", { x: "0", width: "100", height: "13", fill: "url(#gradient)" }),
        extent.map(function (d, i) { return (react_1.default.createElement("text", { key: i, x: i ? 100 : 0, y: "23", fontSize: "10", textAnchor: i ? "end" : "start" }, formatD(d))); })));
};
var Legend = function (_a) {
    var _b = _a.fileTypes, fileTypes = _b === void 0 ? [] : _b, fileColors = _a.fileColors;
    return (react_1.default.createElement("g", { transform: "translate(".concat(width - 60, ", ").concat(height - fileTypes.length * 15 -
            20, ")") },
        fileTypes.map(function (extension, i) { return (react_1.default.createElement("g", { key: i, transform: "translate(0, ".concat(i * 15, ")") },
            react_1.default.createElement("circle", { r: "5", fill: fileColors[extension] }),
            react_1.default.createElement("text", { x: "10", style: { fontSize: "14px", fontWeight: 300 }, dominantBaseline: "middle" },
                ".",
                extension))); }),
        react_1.default.createElement("g", { fill: "#9CA3AF", style: {
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: 12,
            } }, "each dot sized by file size")));
};
var processChild = function (child, getColor, cachedOrders, i, fileColors) {
    var _a;
    if (i === void 0) { i = 0; }
    if (!child)
        return;
    var isRoot = !child.path;
    var name = child.name;
    var path = child.path;
    var children = (_a = child === null || child === void 0 ? void 0 : child.children) === null || _a === void 0 ? void 0 : _a.map(function (c, i) {
        return processChild(c, getColor, cachedOrders, i, fileColors);
    });
    if ((children === null || children === void 0 ? void 0 : children.length) === 1) {
        name = "".concat(name, "/").concat(children[0].name);
        path = children[0].path;
        children = children[0].children;
    }
    var pathWithoutExtension = path === null || path === void 0 ? void 0 : path.split(".").slice(0, -1).join(".");
    var extension = name === null || name === void 0 ? void 0 : name.split(".").slice(-1)[0];
    var hasExtension = !!fileColors[extension];
    if (isRoot && children) {
        var looseChildren = children === null || children === void 0 ? void 0 : children.filter(function (d) { var _a; return !((_a = d.children) === null || _a === void 0 ? void 0 : _a.length); });
        children = __spreadArray(__spreadArray([], children === null || children === void 0 ? void 0 : children.filter(function (d) { var _a; return (_a = d.children) === null || _a === void 0 ? void 0 : _a.length; }), true), [
            {
                name: looseFilesId,
                path: looseFilesId,
                size: 0,
                children: looseChildren,
            },
        ], false);
    }
    var extendedChild = __assign(__assign({}, child), { name: name, path: path, label: name, extension: extension, pathWithoutExtension: pathWithoutExtension, size: (["woff", "woff2", "ttf", "otf", "png", "jpg", "svg"].includes(extension)
            ? 100
            : Math.min(15000, hasExtension ? child.size : Math.min(child.size, 9000))) + i, value: (["woff", "woff2", "ttf", "otf", "png", "jpg", "svg"].includes(extension)
            ? 100
            : Math.min(15000, hasExtension ? child.size : Math.min(child.size, 9000))) + i, color: "#fff", children: children });
    extendedChild.color = getColor(extendedChild);
    extendedChild.sortOrder = getSortOrder(extendedChild, cachedOrders, i);
    return extendedChild;
};
var reflowSiblings = function (siblings, cachedPositions, maxDepth, parentRadius, parentPosition) {
    if (cachedPositions === void 0) { cachedPositions = {}; }
    if (!siblings)
        return;
    var items = __spreadArray([], siblings.map(function (d) {
        var _a, _b;
        return __assign(__assign({}, d), { x: ((_a = cachedPositions[d.data.path]) === null || _a === void 0 ? void 0 : _a[0]) || d.x, y: ((_b = cachedPositions[d.data.path]) === null || _b === void 0 ? void 0 : _b[1]) || d.y, originalX: d.x, originalY: d.y });
    }), true);
    var paddingScale = (0, d3_1.scaleSqrt)().domain([maxDepth, 1]).range([3, 8]).clamp(true);
    var simulation = (0, d3_1.forceSimulation)(items)
        .force("centerX", (0, d3_1.forceX)(width / 2).strength(items[0].depth <= 2 ? 0.01 : 0))
        .force("centerY", (0, d3_1.forceY)(height / 2).strength(items[0].depth <= 2 ? 0.01 : 0))
        .force("centerX2", (0, d3_1.forceX)(parentPosition === null || parentPosition === void 0 ? void 0 : parentPosition[0]).strength(parentPosition ? 0.3 : 0))
        .force("centerY2", (0, d3_1.forceY)(parentPosition === null || parentPosition === void 0 ? void 0 : parentPosition[1]).strength(parentPosition ? 0.8 : 0))
        .force("x", (0, d3_1.forceX)(function (d) { var _a; return ((_a = cachedPositions[d.data.path]) === null || _a === void 0 ? void 0 : _a[0]) || width / 2; }).strength(function (d) { var _a; return ((_a = cachedPositions[d.data.path]) === null || _a === void 0 ? void 0 : _a[1]) ? 0.5 : ((width / height) * 0.3); }))
        .force("y", (0, d3_1.forceY)(function (d) { var _a; return ((_a = cachedPositions[d.data.path]) === null || _a === void 0 ? void 0 : _a[1]) || height / 2; }).strength(function (d) { var _a; return ((_a = cachedPositions[d.data.path]) === null || _a === void 0 ? void 0 : _a[0]) ? 0.5 : ((height / width) * 0.3); }))
        .force("collide", (0, d3_1.forceCollide)(function (d) { return d.children ? d.r + paddingScale(d.depth) : d.r + 1.6; })
        .iterations(8).strength(1))
        .stop();
    for (var i = 0; i < 280; i++) {
        simulation.tick();
        items.forEach(function (d) {
            var _a;
            d.x = (0, utils_1.keepBetween)(d.r, d.x, width - d.r);
            d.y = (0, utils_1.keepBetween)(d.r, d.y, height - d.r);
            if (parentPosition && parentRadius) {
                // keep within radius
                var containedPosition = (0, utils_1.keepCircleInsideCircle)(parentRadius, parentPosition, d.r, [d.x, d.y], !!((_a = d.children) === null || _a === void 0 ? void 0 : _a.length));
                d.x = containedPosition[0];
                d.y = containedPosition[1];
            }
        });
    }
    // setTimeout(() => simulation.stop(), 100);
    var repositionChildren = function (d, xDiff, yDiff) {
        var newD = __assign({}, d);
        newD.x += xDiff;
        newD.y += yDiff;
        if (newD.children) {
            newD.children = newD.children.map(function (c) {
                return repositionChildren(c, xDiff, yDiff);
            });
        }
        return newD;
    };
    var _loop_1 = function (item) {
        var itemCachedPosition = cachedPositions[item.data.path] ||
            [item.x, item.y];
        var itemPositionDiffFromCached = [
            item.x - itemCachedPosition[0],
            item.y - itemCachedPosition[1],
        ];
        if (item.children) {
            var repositionedCachedPositions_1 = __assign({}, cachedPositions);
            var itemReflowDiff_1 = [
                item.x - item.originalX,
                item.y - item.originalY,
            ];
            item.children = item.children.map(function (child) {
                return repositionChildren(child, itemReflowDiff_1[0], itemReflowDiff_1[1]);
            });
            if (item.children.length > 4) {
                if (item.depth > maxDepth)
                    return { value: void 0 };
                item.children.forEach(function (child) {
                    // move cached positions with the parent
                    var childCachedPosition = repositionedCachedPositions_1[child.data.path];
                    if (childCachedPosition) {
                        repositionedCachedPositions_1[child.data.path] = [
                            childCachedPosition[0] + itemPositionDiffFromCached[0],
                            childCachedPosition[1] + itemPositionDiffFromCached[1],
                        ];
                    }
                    else {
                        // const diff = getPositionFromAngleAndDistance(100, item.r);
                        repositionedCachedPositions_1[child.data.path] = [
                            child.x,
                            child.y,
                        ];
                    }
                });
                item.children = reflowSiblings(item.children, repositionedCachedPositions_1, maxDepth, item.r, [item.x, item.y]);
            }
        }
    };
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var state_1 = _loop_1(item);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return items;
};
var getSortOrder = function (item, cachedOrders, i) {
    var _a, _b, _c;
    if (i === void 0) { i = 0; }
    if (cachedOrders[item.path])
        return cachedOrders[item.path];
    if (cachedOrders[(_c = (_b = (_a = item.path) === null || _a === void 0 ? void 0 : _a.split("/")) === null || _b === void 0 ? void 0 : _b.slice(0, -1)) === null || _c === void 0 ? void 0 : _c.join("/")]) {
        return -100000000;
    }
    if (item.name === "public")
        return -1000000;
    // if (item.depth <= 1 && !item.children) {
    //   // item.value *= 0.33;
    //   return item.value  * 100;
    // }
    // if (item.depth <= 1) return -10;
    return item.value + -i;
    // return b.value - a.value;
};
