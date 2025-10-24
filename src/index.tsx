import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Platform, View } from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  PathProps,
  Stop,
} from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  interpolate,
  withTiming,
  SharedValue,
  useAnimatedReaction,
  Easing,
  Extrapolation,
  useDerivedValue,
  EasingFunction,
} from "react-native-reanimated";
import { svgPathProperties } from "svg-path-properties";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PATH_PROPS: PathProps = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export interface gradientProps {
  colors: string[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export type BrushType = "solid" | "dotted" | "dashed" | "highlighter";

export interface DrawPadProps {
  strokeWidth?: number;
  stroke?: string;
  pathLength?: SharedValue<number>;
  playing?: SharedValue<boolean>;
  signed?: SharedValue<boolean>;
  pathProps?: PathProps;
  gradient?: gradientProps;
  brushType?: BrushType;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
  animationDuration?: number;
  easingFunction?: EasingFunction;
}

export type DrawPadHandle = {
  erase: () => void;
  undo: () => void;
  play: () => void;
  stop: () => void;
  getPaths: () => string[];
  setPaths?: (paths: string[]) => void;
  addPath?: (path: string) => void;
  getSVG?: () => Promise<string>;
};

const isWeb = Platform.OS === "web";

const DrawPad = forwardRef<DrawPadHandle, DrawPadProps>(
  (
    {
      strokeWidth = 3.5,
      stroke = "grey",
      pathLength: _pathLength,
      playing,
      signed,
      pathProps: _pathProps,
      gradient,
      brushType = "solid",
      onDrawStart,
      onDrawEnd,
      animationDuration: _duration,
      easingFunction = Easing.bezier(0.4, 0, 0.5, 1),
    },
    ref
  ) => {
    const [paths, setPaths] = useState<string[]>([]);
    const currentPath = useSharedValue<string>("");
    const progress = useSharedValue(1);
    const __pathLength = useSharedValue(0);
    const pathLength = _pathLength || __pathLength;

    const duration = useDerivedValue(() => {
      return _duration || pathLength.value * 2;
    });

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const pathProps = {
      ...(_pathProps || {}),
      ...PATH_PROPS,
    };

    useEffect(() => {
      if (pathLength) {
        const totalLength = paths.reduce((total, path) => {
          return total + new svgPathProperties(path).getTotalLength();
        }, 0);
        pathLength.value = totalLength;
      }
    }, [paths, pathLength]);

    const sharedProps: PathProps = {
      strokeWidth,
      stroke: gradient ? "url(#strokeGradient)" : stroke,
      strokeOpacity: brushType === "highlighter" ? 0.3 : 1,
      strokeDasharray:
        brushType === "dotted"
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

    const handleSetPaths = (newPaths: string[]) => {
      setPaths(newPaths);
    };

    const handleAddPath = (path: string) => {
      setPaths((prev) => [...prev, path]);
    };

    const handleGetSVG = async (): Promise<string> => {
      const svgString = buildSVGString({
        paths,
        gradient,
        ...pathProps,
        ...sharedProps,
      });
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

    useAnimatedReaction(
      () => playing?.value ?? false,
      (isPlaying) => {
        if (!playing || !pathLength) return;

        if (isPlaying) {
          progress.value = 0;
          progress.value = withTiming(1, {
            duration: duration.value,
            easing: easingFunction,
          });
          return;
        }

        progress.value = withTiming(
          0,
          {
            duration:
              signed?.value || progress.value > 0.999
                ? 1
                : progress.value * duration.value,
            easing: easingFunction,
          },
          () => {
            progress.value = 1;
          }
        );
      }
    );

    return (
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1 }}>
          <Svg height={"100%"} width={"100%"}>
            {gradient && (
              <Defs>
                <LinearGradient
                  id="strokeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  {gradient.colors.map((color, i) => (
                    <Stop
                      key={i}
                      offset={
                        gradient.locations?.[i] ??
                        i / (gradient.colors.length - 1)
                      }
                      stopColor={color}
                    />
                  ))}
                </LinearGradient>
              </Defs>
            )}
            {paths.map((p, i) => {
              const prevLength = paths.slice(0, i).reduce((total, prevPath) => {
                return total + new svgPathProperties(prevPath).getTotalLength();
              }, 0);

              return (
                <DrawPath
                  key={i}
                  path={p}
                  progress={progress}
                  prevLength={prevLength}
                  totalPathLength={pathLength}
                  {...sharedProps}
                  {...pathProps}
                />
              );
            })}
            <AnimatedPath
              {...pathProps}
              {...sharedProps}
              animatedProps={animatedProps}
            />
          </Svg>
        </View>
      </GestureDetector>
    );
  }
);

const DrawPath = ({
  path,
  strokeWidth,
  stroke,
  progress,
  prevLength,
  totalPathLength,
  ...pathProps
}: {
  path: string;
  prevLength?: number;
  progress?: SharedValue<number>;
  totalPathLength?: SharedValue<number>;
} & Omit<PathProps, "d">) => {
  const pathRef = useRef<Path>(null);
  // Adjustment added to account for rendering quirks in strokeDasharray calculations.
  const PATH_LENGTH_ADJUSTMENT = 1;
  const length =
    new svgPathProperties(path).getTotalLength() + PATH_LENGTH_ADJUSTMENT;

  const { strokeOpacity, strokeDasharray } = pathProps;

  const animatedProps = useAnimatedProps(() => {
    const prev = prevLength ?? 0;
    const total = totalPathLength?.value ?? 0;

    const start = prev / total;
    const end = (prev + length) / total;
    const p = progress?.value ?? 1;

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

  return (
    <G>
      <Path
        d={path}
        {...pathProps}
        strokeWidth={strokeWidth}
        stroke={stroke}
        ref={pathRef}
        strokeOpacity={Number(strokeOpacity) * 0.2}
      />
      <AnimatedPath
        d={path}
        {...pathProps}
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeDasharray={dasharray || length}
        animatedProps={dasharray ? {} : animatedProps}
      />
    </G>
  );
};

const buildDefsString = (gradient?: gradientProps): string => {
  if (!gradient) return "";

  const stops = gradient.colors
    .map((color, i) => {
      const offset =
        gradient.locations?.[i] ?? i / (gradient.colors.length - 1);
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

export const buildSVGString = ({
  paths,
  gradient,
  ...pathProps
}: {
  paths: String[];
  gradient?: gradientProps;
} & PathProps) => {
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
