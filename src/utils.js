"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepCircleInsideCircle = exports.getAngleFromPosition = exports.getPositionFromAngleAndDistance = exports.keepBetween = exports.truncateString = void 0;
var truncateString = function (string, length) {
    if (string === void 0) { string = ""; }
    if (length === void 0) { length = 20; }
    return string.length > length + 3
        ? string.substring(0, length) + "..."
        : string;
};
exports.truncateString = truncateString;
var keepBetween = function (min, max, value) {
    return Math.max(min, Math.min(max, value));
};
exports.keepBetween = keepBetween;
var getPositionFromAngleAndDistance = function (angle, distance) {
    var radians = angle / 180 * Math.PI;
    return [
        Math.cos(radians) * distance,
        Math.sin(radians) * distance,
    ];
};
exports.getPositionFromAngleAndDistance = getPositionFromAngleAndDistance;
var getAngleFromPosition = function (x, y) {
    return Math.atan2(y, x) * 180 / Math.PI;
};
exports.getAngleFromPosition = getAngleFromPosition;
var keepCircleInsideCircle = function (parentR, parentPosition, childR, childPosition, isParent) {
    if (isParent === void 0) { isParent = false; }
    var distance = Math.sqrt(Math.pow(parentPosition[0] - childPosition[0], 2) +
        Math.pow(parentPosition[1] - childPosition[1], 2));
    var angle = (0, exports.getAngleFromPosition)(childPosition[0] - parentPosition[0], childPosition[1] - parentPosition[1]);
    // leave space for labels
    var padding = Math.min(angle < -20 && angle > -100 && isParent ? 13 : 3, parentR * 0.2);
    if (distance > (parentR - childR - padding)) {
        var diff = (0, exports.getPositionFromAngleAndDistance)(angle, parentR - childR - padding);
        return [
            parentPosition[0] + diff[0],
            parentPosition[1] + diff[1],
        ];
    }
    return childPosition;
};
exports.keepCircleInsideCircle = keepCircleInsideCircle;
