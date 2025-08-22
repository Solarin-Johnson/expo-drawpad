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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, } from "react";
import { Platform, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedProps, runOnJS, interpolate, withTiming, useAnimatedReaction, Easing, runOnUI, Extrapolation, } from "react-native-reanimated";
import { svgPathProperties } from "svg-path-properties";
var AnimatedPath = Animated.createAnimatedComponent(Path);
var PATH_PROPS = {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
};
var isWeb = Platform.OS === "web";
var DrawPad = forwardRef(function (_a, ref) {
    var _b = _a.strokeWidth, strokeWidth = _b === void 0 ? 3.5 : _b, _c = _a.stroke, stroke = _c === void 0 ? "grey" : _c, pathLength = _a.pathLength, playing = _a.playing, signed = _a.signed;
    var _d = useState([]), paths = _d[0], setPaths = _d[1];
    var currentPath = useSharedValue("");
    var progress = useSharedValue(1);
    useEffect(function () {
        if (pathLength) {
            var totalLength = paths.reduce(function (total, path) {
                return total + new svgPathProperties(path).getTotalLength();
            }, 0);
            pathLength.value = totalLength;
        }
    }, [paths, pathLength]);
    var animatedProps = useAnimatedProps(function () { return ({
        d: currentPath.value,
    }); });
    var finishPath = function () {
        var pathValue = currentPath.value;
        if (pathValue) {
            setPaths(function (prev) {
                var updatedPaths = __spreadArray(__spreadArray([], prev, true), [pathValue], false);
                setTimeout(function () {
                    currentPath.value = "";
                }, 0);
                return updatedPaths;
            });
        }
    };
    var handleErase = function () {
        setPaths([]);
        currentPath.value = "";
    };
    var handleUndo = useCallback(function () {
        setPaths(function (prev) {
            var newPaths = __spreadArray([], prev, true);
            newPaths.pop();
            return newPaths;
        });
    }, []);
    var timeoutRef = useRef(null);
    var handlePlay = useCallback(function () {
        if (playing && pathLength && !playing.value) {
            playing.value = true;
            timeoutRef.current = setTimeout(function () {
                playing.value = false;
            }, pathLength.value * 2);
        }
    }, [playing, pathLength]);
    var handleStop = useCallback(function () {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (playing) {
            runOnUI(function () {
                playing.value = false;
            })();
        }
    }, [playing]);
    useImperativeHandle(ref, function () { return ({
        erase: handleErase,
        undo: handleUndo,
        play: handlePlay,
        stop: handleStop,
    }); });
    var panGesture = Gesture.Pan()
        .minDistance(0)
        .onStart(function (e) {
        currentPath.value = "M ".concat(e.x, " ").concat(e.y);
    })
        .onUpdate(function (e) {
        currentPath.value += " L ".concat(e.x, " ").concat(e.y);
    })
        .onEnd(function () {
        runOnJS(finishPath)();
    });
    useAnimatedReaction(function () { var _a; return (_a = playing === null || playing === void 0 ? void 0 : playing.value) !== null && _a !== void 0 ? _a : false; }, function (isPlaying) {
        if (!playing || !pathLength)
            return;
        var duration = pathLength.value * 2;
        var easingFunction = Easing.bezier(0.4, 0, 0.5, 1);
        if (isPlaying) {
            progress.value = 0;
            progress.value = withTiming(1, { duration: duration, easing: easingFunction });
            return;
        }
        progress.value = withTiming(0, {
            duration: (signed === null || signed === void 0 ? void 0 : signed.value) || progress.value > 0.999
                ? 1
                : progress.value * duration,
            easing: easingFunction,
        }, function () {
            progress.value = 1;
        });
    });
    return (React.createElement(GestureDetector, { gesture: panGesture },
        React.createElement(View, { style: { flex: 1 } },
            React.createElement(Svg, { height: "100%", width: "100%" },
                paths.map(function (p, i) {
                    var prevLength = paths.slice(0, i).reduce(function (total, prevPath) {
                        return total + new svgPathProperties(prevPath).getTotalLength();
                    }, 0);
                    return (React.createElement(DrawPath, { key: i, path: p, strokeWidth: strokeWidth, stroke: stroke, progress: progress, prevLength: prevLength, totalPathLength: pathLength }));
                }),
                React.createElement(AnimatedPath, __assign({ animatedProps: animatedProps, stroke: stroke, strokeWidth: strokeWidth }, PATH_PROPS))))));
});
var DrawPath = function (_a) {
    var path = _a.path, strokeWidth = _a.strokeWidth, stroke = _a.stroke, progress = _a.progress, prevLength = _a.prevLength, totalPathLength = _a.totalPathLength;
    var pathRef = useRef(null);
    // Adjustment added to account for rendering quirks in strokeDasharray calculations.
    var PATH_LENGTH_ADJUSTMENT = 1;
    var length = new svgPathProperties(path).getTotalLength() + PATH_LENGTH_ADJUSTMENT;
    var animatedProps = useAnimatedProps(function () {
        var _a, _b;
        var prev = prevLength !== null && prevLength !== void 0 ? prevLength : 0;
        var total = (_a = totalPathLength === null || totalPathLength === void 0 ? void 0 : totalPathLength.value) !== null && _a !== void 0 ? _a : 0;
        var start = prev / total;
        var end = (prev + length) / total;
        var p = (_b = progress === null || progress === void 0 ? void 0 : progress.value) !== null && _b !== void 0 ? _b : 1;
        var turn = interpolate(p, [start, end], [0, 1], Extrapolation.CLAMP);
        var opacity = p >= start ? 1 : 0;
        return {
            strokeDashoffset: interpolate(turn, [0, 1], [length, 0]) - 1,
            opacity: opacity,
        };
    });
    return (React.createElement(G, null,
        React.createElement(Path, __assign({ d: path, strokeWidth: strokeWidth, stroke: stroke, ref: pathRef, strokeOpacity: 0.2 }, PATH_PROPS)),
        React.createElement(AnimatedPath, __assign({ d: path, strokeWidth: strokeWidth, stroke: stroke, strokeDasharray: length, animatedProps: animatedProps }, PATH_PROPS))));
};
export default DrawPad;
