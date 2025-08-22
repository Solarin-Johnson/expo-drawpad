# expo-drawpad

A smooth, animated drawing pad component for React Native and Expo applications. Perfect for signatures, sketches, and interactive drawing experiences.

## Features

- ✨ **Smooth Drawing**: Responsive touch gestures with customizable stroke width and color
- 🎬 **Path Animation**: Replay drawings with smooth animations
- ↩️ **Undo/Redo**: Built-in undo functionality for better user experience
- 🧹 **Clear Canvas**: Easy erase functionality to start fresh
- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 🎯 **TypeScript**: Full TypeScript support with type definitions
- 🪶 **Lightweight**: Minimal dependencies and optimized performance

## Installation

```bash
npm install expo-drawpad
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-svg
```

For Expo projects, you can install them with:

```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-svg
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

| Prop          | Type                   | Required | Default     | Description                                         |
| ------------- | ---------------------- | -------- | ----------- | --------------------------------------------------- |
| `stroke`      | `string`               | No       | `"#000000"` | Color of the drawing stroke (hex, rgb, etc.)        |
| `pathLength`  | `SharedValue<number>`  | No       | -           | Reanimated shared value for total path length       |
| `playing`     | `SharedValue<boolean>` | No       | -           | Reanimated shared value for animation state         |
| `strokeWidth` | `number`               | No       | `3.5`       | Width of the drawing stroke                         |
| `signed`      | `SharedValue<boolean>` | No       | -           | Optional shared value to track if anything is drawn |

### Methods (via ref)

| Method    | Description                           |
| --------- | ------------------------------------- |
| `erase()` | Clears the entire drawing canvas      |
| `undo()`  | Removes the last drawn path           |
| `play()`  | Starts the drawing animation playback |
| `stop()`  | Stops the current animation playback  |

## Usage Examples

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

- React Native 0.72+
- Expo SDK 49+
- iOS 11.0+
- Android API Level 21+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

Solarin Johnson

---

Made with ❤️ for the React Native community
