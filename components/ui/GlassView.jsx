import { BlurView } from "expo-blur";
import { View } from "react-native";
import { styled } from "nativewind";

// Wrap components to accept NativeWind classNames
const StyledBlur = styled(BlurView);
const StyledView = styled(View);

export const GlassView = ({
  children,
  className = "",
  intensity = 80,
  tint = "light",
  ...props
}) => {
  return (
    <StyledView
      className={`overflow-hidden rounded-2xl border border-white/20 bg-white/10 ${className}`}
      {...props}
    >
      <StyledBlur intensity={intensity} tint={tint} className="flex-1">
        {children}
      </StyledBlur>
    </StyledView>
  );
};
