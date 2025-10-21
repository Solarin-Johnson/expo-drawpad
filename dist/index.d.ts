import React from "react";
import { PathProps } from "react-native-svg";
import { SharedValue } from "react-native-reanimated";
export interface DrawPadProps {
    strokeWidth?: number;
    stroke?: string;
    pathLength?: SharedValue<number>;
    playing?: SharedValue<boolean>;
    signed?: SharedValue<boolean>;
    pathProps?: PathProps;
}
export type DrawPadHandle = {
    erase: () => void;
    undo: () => void;
    play: () => void;
    stop: () => void;
};
declare const DrawPad: React.ForwardRefExoticComponent<DrawPadProps & React.RefAttributes<DrawPadHandle>>;
export default DrawPad;
