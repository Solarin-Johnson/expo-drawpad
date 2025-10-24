# expo-drawpad

[![npm version](https://badge.fury.io/js/expo-drawpad.svg)](https://badge.fury.io/js/expo-drawpad)
[![npm downloads](https://img.shields.io/npm/dm/expo-drawpad.svg)](https://www.npmjs.com/package/expo-drawpad)
[![license](https://img.shields.io/npm/l/expo-drawpad.svg)](https://github.com/solarinjohnson/expo-drawpad/blob/main/LICENSE)

A smooth, animated drawing pad component for React Native and Expo applications. Perfect for signatures, sketches, and interactive drawing experiences.

## Features

- ✨ **Smooth Drawing**: Responsive touch gestures with customizable stroke width and color
- 🎬 **Path Animation**: Replay drawings with smooth animations
- 🎨 **Multiple Brush Types**: Solid, dotted, dashed, and highlighter brush styles
- 🌈 **Gradient Support**: Apply beautiful gradients to your strokes
- ↩️ **Undo/Redo**: Built-in undo functionality for better user experience
- 🧹 **Clear Canvas**: Easy erase functionality to start fresh
- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 🎯 **TypeScript**: Full TypeScript support with type definitions
- 🪶 **Lightweight**: Minimal dependencies and optimized performance
- 📁 **Path Management**: Get, set, and add paths programmatically
- 📄 **SVG Export**: Export drawings as SVG strings
- 🎛️ **Customizable Animation**: Control animation duration and easing
- 🎪 **Event Callbacks**: Handle draw start and end events

## Installation

```bash
npm install expo-drawpad
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-svg react-native-worklets
```

For Expo projects, you can install them with:

```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-svg react-native-worklets
```

## Quick Start

### Minimal Example

```tsx
import React, { useRef } from "react";
import { View, Button } from "react-native";
import DrawPad, { DrawPadHandle } from "expo-drawpad";

export default function App() {
  const drawPadRef = useRef<DrawPadHandle>(null);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flex: 1, backgroundColor: "#f0f0f0", borderRadius: 10 }}>
        <DrawPad ref={drawPadRef} />
      </View>

      <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
        <Button title="Clear" onPress={() => drawPadRef.current?.erase()} />
        <Button title="Undo" onPress={() => drawPadRef.current?.undo()} />
      </View>
    </View>
  );
}
```

### Full Example with Animation

```tsx
import React, { useRef } from "react";
import { View, Button } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import DrawPad, { DrawPadHandle } from "expo-drawpad";

export default function App() {
  const drawPadRef = useRef<DrawPadHandle>(null);
  const pathLength = useSharedValue(0);
  const playing = useSharedValue(false);
  const signed = useSharedValue(false);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flex: 1, backgroundColor: "#f0f0f0", borderRadius: 10 }}>
        <DrawPad
          ref={drawPadRef}
          stroke="#000000"
          strokeWidth={3}
          pathLength={pathLength}
          playing={playing}
          signed={signed}
        />
      </View>

      <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
        <Button title="Clear" onPress={() => drawPadRef.current?.erase()} />
        <Button title="Undo" onPress={() => drawPadRef.current?.undo()} />
        <Button title="Play" onPress={() => drawPadRef.current?.play()} />
        <Button title="Stop" onPress={() => drawPadRef.current?.stop()} />
      </View>
    </View>
  );
}
```

## API Reference

### Props

| Prop                | Type                   | Required | Default                         | Description                                         |
| ------------------- | ---------------------- | -------- | ------------------------------- | --------------------------------------------------- |
| `stroke`            | `string`               | No       | `"grey"`                        | Color of the drawing stroke (hex, rgb, etc.)        |
| `pathLength`        | `SharedValue<number>`  | No       | -                               | Reanimated shared value for total path length       |
| `playing`           | `SharedValue<boolean>` | No       | -                               | Reanimated shared value for animation state         |
| `strokeWidth`       | `number`               | No       | `3.5`                           | Width of the drawing stroke                         |
| `signed`            | `SharedValue<boolean>` | No       | -                               | Optional shared value to track if anything is drawn |
| `pathProps`         | `PathProps`            | No       | -                               | Additional SVG path properties                      |
| `gradient`          | `gradientProps`        | No       | -                               | Gradient configuration for stroke                   |
| `brushType`         | `BrushType`            | No       | `"solid"`                       | Brush style: solid, dotted, dashed, or highlighter  |
| `onDrawStart`       | `() => void`           | No       | -                               | Callback when drawing starts                        |
| `onDrawEnd`         | `() => void`           | No       | -                               | Callback when drawing ends                          |
| `animationDuration` | `number`               | No       | `pathLength.value * 2`          | Custom animation duration in milliseconds           |
| `easingFunction`    | `EasingFunction`       | No       | `Easing.bezier(0.4, 0, 0.5, 1)` | Custom easing function for animations               |

### Types

```tsx
export interface gradientProps {
  colors: string[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export type BrushType = "solid" | "dotted" | "dashed" | "highlighter";
```

### Methods (via ref)

| Method                      | Description                            |
| --------------------------- | -------------------------------------- |
| `erase()`                   | Clears the entire drawing canvas       |
| `undo()`                    | Removes the last drawn path            |
| `play()`                    | Starts the drawing animation playback  |
| `stop()`                    | Stops the current animation playback   |
| `getPaths()`                | Returns array of all drawn paths       |
| `setPaths(paths: string[])` | Sets the paths programmatically        |
| `addPath(path: string)`     | Adds a single path to the canvas       |
| `getSVG()`                  | Returns Promise<string> of SVG content |

## Usage Examples

### Basic Drawing with Different Brush Types

```tsx
import React, { useRef, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import DrawPad, { DrawPadHandle, BrushType } from "expo-drawpad";

export function BrushTypesExample() {
  const drawPadRef = useRef<DrawPadHandle>(null);
  const [brushType, setBrushType] = useState<BrushType>("solid");

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        <DrawPad
          ref={drawPadRef}
          brushType={brushType}
          stroke="#2563eb"
          strokeWidth={4}
        />
      </View>

      <View style={styles.controls}>
        <Button title="Solid" onPress={() => setBrushType("solid")} />
        <Button title="Dotted" onPress={() => setBrushType("dotted")} />
        <Button title="Dashed" onPress={() => setBrushType("dashed")} />
        <Button
          title="Highlighter"
          onPress={() => setBrushType("highlighter")}
        />
      </View>
    </View>
  );
}
```

### Drawing with Gradient

```tsx
import React, { useRef } from "react";
import { View, Button } from "react-native";
import DrawPad, { DrawPadHandle } from "expo-drawpad";

export function GradientExample() {
  const drawPadRef = useRef<DrawPadHandle>(null);

  const gradient = {
    colors: ["#ff6b35", "#f7931e", "#ffd23f"],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawPad ref={drawPadRef} gradient={gradient} strokeWidth={6} />

      <Button title="Clear" onPress={() => drawPadRef.current?.erase()} />
    </View>
  );
}
```

### Drawing with Event Callbacks

```tsx
import React, { useRef, useState } from "react";
import { View, Text, Button } from "react-native";
import DrawPad, { DrawPadHandle } from "expo-drawpad";

export function CallbackExample() {
  const drawPadRef = useRef<DrawPadHandle>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pathCount, setPathCount] = useState(0);

  const handleDrawStart = () => {
    setIsDrawing(true);
  };

  const handleDrawEnd = () => {
    setIsDrawing(false);
    setPathCount((prev) => prev + 1);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Drawing: {isDrawing ? "Yes" : "No"}</Text>
      <Text>Paths drawn: {pathCount}</Text>

      <View style={{ flex: 1, backgroundColor: "#f0f0f0", margin: 10 }}>
        <DrawPad
          ref={drawPadRef}
          onDrawStart={handleDrawStart}
          onDrawEnd={handleDrawEnd}
          stroke="#10b981"
        />
      </View>

      <Button
        title="Clear"
        onPress={() => {
          drawPadRef.current?.erase();
          setPathCount(0);
        }}
      />
    </View>
  );
}
```

### SVG Export

```tsx
import React, { useRef } from "react";
import { View, Button, Alert } from "react-native";
import DrawPad, { DrawPadHandle } from "expo-drawpad";

export function SVGExportExample() {
  const drawPadRef = useRef<DrawPadHandle>(null);

  const handleExportSVG = async () => {
    try {
      const svgString = await drawPadRef.current?.getSVG();
      if (svgString) {
        // You can save this SVG string to a file or send it to a server
        Alert.alert("SVG Exported", "Check console for SVG string");
        console.log(svgString);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export SVG");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawPad ref={drawPadRef} stroke="#8b5cf6" strokeWidth={3} />

      <View style={{ flexDirection: "row", padding: 20, gap: 10 }}>
        <Button title="Export SVG" onPress={handleExportSVG} />
        <Button title="Clear" onPress={() => drawPadRef.current?.erase()} />
      </View>
    </View>
  );
}
```

### Signature Pad

```tsx
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import DrawPad, { DrawPadHandle } from "expo-drawpad";

export function SignaturePad() {
  const drawPadRef = useRef<DrawPadHandle>(null);
  const pathLength = useSharedValue(0);
  const playing = useSharedValue(false);
  const signed = useSharedValue(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please sign below</Text>

      <View style={styles.canvas}>
        <DrawPad
          ref={drawPadRef}
          stroke="#2563eb"
          strokeWidth={2}
          pathLength={pathLength}
          playing={playing}
          signed={signed}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => drawPadRef.current?.erase()}
        >
          <Text>Clear Signature</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  canvas: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttons: { marginTop: 20 },
  button: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
  },
});
```

### Drawing with Animation

```tsx
import React, { useRef } from "react";
import { View, Button } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import DrawPad, { DrawPadHandle } from "expo-drawpad";

export function AnimatedDrawing() {
  const drawPadRef = useRef<DrawPadHandle>(null);
  const pathLength = useSharedValue(0);
  const playing = useSharedValue(false);

  const handleReplay = () => {
    drawPadRef.current?.play();
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawPad
        ref={drawPadRef}
        stroke="#ff6b35"
        strokeWidth={4}
        pathLength={pathLength}
        playing={playing}
      />

      <Button title="Replay Drawing" onPress={handleReplay} />
    </View>
  );
}
```

## Requirements

- React Native 0.81.4+
- React Native Reanimated 4.1.1+
- React Native Gesture Handler 2.28.0+
- React Native SVG 15.12.1+
- React Native Worklets 0.5.1+
- Expo SDK 51+
- iOS 13.0+
- Android API Level 23+

## Troubleshooting

### Common Issues

#### Gestures not working

Make sure you have properly configured `react-native-gesture-handler` in your project. For React Native CLI projects, you may need to complete the platform-specific installation steps.

#### Animation not smooth

Ensure `react-native-reanimated` is properly installed and configured. For React Native CLI projects, you may need to rebuild your app after installation.

#### SVG not rendering

Verify that `react-native-svg` is correctly installed and linked. For React Native CLI projects, you may need to run `cd ios && pod install`.

### Performance Tips

- Use `strokeWidth` between 1-10 for optimal performance
- Limit drawing area size for better performance on older devices
- Consider using `signed` shared value to track drawing state efficiently

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### 0.3.0

- ✨ **NEW**: Added multiple brush types (solid, dotted, dashed, highlighter)
- ✨ **NEW**: Added gradient support for strokes
- ✨ **NEW**: Added SVG export functionality (`getSVG()` method)
- ✨ **NEW**: Added path management methods (`getPaths()`, `setPaths()`, `addPath()`)
- ✨ **NEW**: Added draw event callbacks (`onDrawStart`, `onDrawEnd`)
- ✨ **NEW**: Added customizable animation duration and easing
- ✨ **NEW**: Added additional path properties support
- 🔧 **IMPROVED**: Smoother drawing with quadratic curves instead of linear paths
- 🔧 **IMPROVED**: Better worklets integration for performance
- 🔧 **IMPROVED**: Updated peer dependencies to latest versions
- 🔧 **IMPROVED**: Enhanced TypeScript definitions

## License

ISC

## Author

Solarin Johnson

---

Made with ❤️ for the React Native community
