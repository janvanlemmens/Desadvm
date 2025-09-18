// FancyPressable.js
import React from "react";
import {
  Pressable,
  Text,
  Platform,
  StyleSheet,
} from "react-native";

const defaultBg = "#c96161ff";
const defaultText = "#FFFFFF";

// darkens a hex color (#RRGGBB)
function darken(hex, amount = 0.12) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.round(r * (1 - amount))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 - amount))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 - amount))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function CustomPressable({
  text,
  color = defaultBg,
  textColor = defaultText,
  borderRadius = 14,
  width,
  onPress,
  disabled,
  style,
  textStyle,
  hoverColor, // optional (web only)
}) {
  const pressedColor = darken(color, 0.14);
  const rippleColor = darken(color, 0.25);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      android_ripple={
        Platform.OS === "android"
          ? { color: rippleColor, borderless: false }
          : undefined
      }
      style={({ pressed, hovered }) => [
        styles.base,
        {
          backgroundColor:
            hovered && hoverColor
              ? hoverColor
              : pressed
              ? pressedColor
              : color,
          borderRadius,
          width: width,
          elevation: Platform.OS === "android" ? (pressed ? 2 : 4) : 0,
          shadowOpacity: Platform.OS === "ios" ? (pressed ? 0.12 : 0.2) : 0,
        },
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
     marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  text: {
    fontWeight: "400",
    fontSize: 16,
  },
});
