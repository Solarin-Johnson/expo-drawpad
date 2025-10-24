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
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, } from "react";
import { Platform, View } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Stop, } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedProps, interpolate, withTiming, useAnimatedReaction, Easing, Extrapolation, useDerivedValue, } from "react-native-reanimated";
import { svgPathProperties } from "svg-path-properties";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";
const AnimatedPath = Animated.createAnimatedComponent(Path);
const PATH_PROPS = {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
};
const isWeb = Platform.OS === "web";
const DrawPad = forwardRef(({ strokeWidth = 3.5, stroke = "grey", pathLength: _pathLength, playing, signed, pathProps: _pathProps, gradient, brushType = "solid", onDrawStart, onDrawEnd, animationDuration: _duration, easingFunction = Easing.bezier(0.4, 0, 0.5, 1), }, ref) => {
    const [paths, setPaths] = useState([]);
    const currentPath = useSharedValue("");
    const progress = useSharedValue(1);
    const __pathLength = useSharedValue(0);
    const pathLength = _pathLength || __pathLength;
    const duration = useDerivedValue(() => {
        return _duration || pathLength.value * 2;
    });
    const timeoutRef = useRef(null);
    const pathProps = Object.assign(Object.assign({}, (_pathProps || {})), PATH_PROPS);
    useEffect(() => {
        if (pathLength) {
            const totalLength = paths.reduce((total, path) => {
                return total + new svgPathProperties(path).getTotalLength();
            }, 0);
            pathLength.value = totalLength;
        }
    }, [paths, pathLength]);
    const sharedProps = {
        strokeWidth,
        stroke: gradient ? "url(#strokeGradient)" : stroke,
        strokeOpacity: brushType === "highlighter" ? 0.3 : 1,
        strokeDasharray: brushType === "dotted"
            ? [1, strokeWidth * 2]
            : brushType === "dashed"
                ? [strokeWidth * 4, strokeWidth * 2]
                : "0",
    };
    const animatedProps = useAnimatedProps(() => ({
        d: currentPath.value,
    }));
    const finishPath = () => {
        const pathValue = currentPath.value;
        if (onDrawEnd) {
            scheduleOnRN(onDrawEnd);
        }
        if (pathValue) {
            setPaths((prev) => {
                const updatedPaths = [...prev, pathValue];
                setTimeout(() => {
                    currentPath.value = "";
                }, 0);
                return updatedPaths;
            });
        }
    };
    const handleErase = () => {
        setPaths([]);
        currentPath.value = "";
    };
    const handleUndo = useCallback(() => {
        setPaths((prev) => {
            const newPaths = [...prev];
            newPaths.pop();
            return newPaths;
        });
    }, []);
    const handlePlay = useCallback(() => {
        if (playing && pathLength && !playing.value) {
            playing.value = true;
            timeoutRef.current = setTimeout(() => {
                playing.value = false;
            }, duration.value);
        }
    }, [playing, pathLength]);
    const handleStop = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (playing) {
            scheduleOnUI(() => {
                playing.value = false;
            });
        }
    }, [playing]);
    const handleSetPaths = (newPaths) => {
        setPaths(newPaths);
    };
    const handleAddPath = (path) => {
        setPaths((prev) => [...prev, path]);
    };
    const handleGetSVG = async () => {
        const svgString = buildSVGString(Object.assign(Object.assign({ paths,
            gradient }, pathProps), sharedProps));
        return svgString;
    };
    useImperativeHandle(ref, () => ({
        erase: handleErase,
        undo: handleUndo,
        play: handlePlay,
        stop: handleStop,
        getPaths: () => paths,
        setPaths: handleSetPaths,
        addPath: handleAddPath,
        getSVG: handleGetSVG,
    }));
    const prevX = useSharedValue(0);
    const prevY = useSharedValue(0);
    const panGesture = Gesture.Pan()
        .minDistance(0)
        .onStart((e) => {
        currentPath.value = `M ${e.x} ${e.y}`;
        prevX.value = e.x;
        prevY.value = e.y;
        if (onDrawStart) {
            scheduleOnRN(onDrawStart);
        }
    })
        .onUpdate((e) => {
        const midX = (prevX.value + e.x) / 2;
        const midY = (prevY.value + e.y) / 2;
        currentPath.value += ` Q ${prevX.value} ${prevY.value} ${midX} ${midY}`;
        prevX.value = e.x;
        prevY.value = e.y;
    })
        .onEnd(() => {
        scheduleOnRN(finishPath);
    });
    useAnimatedReaction(() => { var _a; return (_a = playing === null || playing === void 0 ? void 0 : playing.value) !== null && _a !== void 0 ? _a : false; }, (isPlaying) => {
        if (!playing || !pathLength)
            return;
        if (isPlaying) {
            progress.value = 0;
            progress.value = withTiming(1, {
                duration: duration.value,
                easing: easingFunction,
            });
            return;
        }
        progress.value = withTiming(0, {
            duration: (signed === null || signed === void 0 ? void 0 : signed.value) || progress.value > 0.999
                ? 1
                : progress.value * duration.value,
            easing: easingFunction,
        }, () => {
            progress.value = 1;
        });
    });
    return (React.createElement(GestureDetector, { gesture: panGesture },
        React.createElement(View, { style: { flex: 1 } },
            React.createElement(Svg, { height: "100%", width: "100%" },
                gradient && (React.createElement(Defs, null,
                    React.createElement(LinearGradient, { id: "strokeGradient", x1: "0%", y1: "0%", x2: "100%", y2: "0%" }, gradient.colors.map((color, i) => {
                        var _a, _b;
                        return (React.createElement(Stop, { key: i, offset: (_b = (_a = gradient.locations) === null || _a === void 0 ? void 0 : _a[i]) !== null && _b !== void 0 ? _b : i / (gradient.colors.length - 1), stopColor: color }));
                    })))),
                paths.map((p, i) => {
                    const prevLength = paths.slice(0, i).reduce((total, prevPath) => {
                        return total + new svgPathProperties(prevPath).getTotalLength();
                    }, 0);
                    return (React.createElement(DrawPath, Object.assign({ key: i, path: p, progress: progress, prevLength: prevLength, totalPathLength: pathLength }, sharedProps, pathProps)));
                }),
                React.createElement(AnimatedPath, Object.assign({}, pathProps, sharedProps, { animatedProps: animatedProps }))))));
});
const DrawPath = (_a) => {
    var { path, strokeWidth, stroke, progress, prevLength, totalPathLength } = _a, pathProps = __rest(_a, ["path", "strokeWidth", "stroke", "progress", "prevLength", "totalPathLength"]);
    const pathRef = useRef(null);
    // Adjustment added to account for rendering quirks in strokeDasharray calculations.
    const PATH_LENGTH_ADJUSTMENT = 1;
    const length = new svgPathProperties(path).getTotalLength() + PATH_LENGTH_ADJUSTMENT;
    const { strokeOpacity, strokeDasharray } = pathProps;
    const animatedProps = useAnimatedProps(() => {
        var _a, _b;
        const prev = prevLength !== null && prevLength !== void 0 ? prevLength : 0;
        const total = (_a = totalPathLength === null || totalPathLength === void 0 ? void 0 : totalPathLength.value) !== null && _a !== void 0 ? _a : 0;
        const start = prev / total;
        const end = (prev + length) / total;
        const p = (_b = progress === null || progress === void 0 ? void 0 : progress.value) !== null && _b !== void 0 ? _b : 1;
        const turn = interpolate(p, [start, end], [0, 1], Extrapolation.CLAMP);
        const opacity = p >= start ? 1 : 0;
        return {
            strokeDashoffset: interpolate(turn, [0, 1], [length, 0]) - 1,
            opacity,
        };
    });
    const dasharray = Array.isArray(strokeDasharray)
        ? strokeDasharray
        : undefined;
    return (React.createElement(G, null,
        React.createElement(Path, Object.assign({ d: path }, pathProps, { strokeWidth: strokeWidth, stroke: stroke, ref: pathRef, strokeOpacity: Number(strokeOpacity) * 0.2 })),
        React.createElement(AnimatedPath, Object.assign({ d: path }, pathProps, { strokeWidth: strokeWidth, stroke: stroke, strokeDasharray: dasharray || length, animatedProps: dasharray ? {} : animatedProps }))));
};
const buildDefsString = (gradient) => {
    if (!gradient)
        return "";
    const stops = gradient.colors
        .map((color, i) => {
        var _a, _b;
        const offset = (_b = (_a = gradient.locations) === null || _a === void 0 ? void 0 : _a[i]) !== null && _b !== void 0 ? _b : i / (gradient.colors.length - 1);
        return `<stop offset="${offset}" stop-color="${color}" />`;
    })
        .join("\n");
    return `
    <defs>
      <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        ${stops}
      </linearGradient>
    </defs>
  `;
};
export const buildSVGString = (_a) => {
    var { paths, gradient } = _a, pathProps = __rest(_a, ["paths", "gradient"]);
    const defs = buildDefsString(gradient);
    const svgPaths = paths
        .map((d) => {
        const kebabProps = Object.entries(pathProps || {})
            .filter(([_, v]) => v !== undefined)
            .map(([key, value]) => {
            const kebabKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
            return `${kebabKey}="${String(value)}"`;
        });
        return `<path d="${d}" ${kebabProps.join(" ")} />`;
    })
        .join("\n");
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      ${defs}
      ${svgPaths}
    </svg>
  `.trim();
};
export default DrawPad;
