import React from "react";
import { PathProps } from "react-native-svg";
import { SharedValue, EasingFunction } from "react-native-reanimated";
export interface gradientProps {
    colors: string[];
    locations?: number[];
    start?: {
        x: number;
        y: number;
    };
    end?: {
        x: number;
        y: number;
    };
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
declare const DrawPad: React.ForwardRefExoticComponent<DrawPadProps & React.RefAttributes<DrawPadHandle>>;
export declare const buildSVGString: ({ paths, gradient, ...pathProps }: {
    paths: String[];
    gradient?: gradientProps;
} & PathProps) => string;
export default DrawPad;
