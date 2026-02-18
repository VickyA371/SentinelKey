import React from "react";
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native';

type AppInputProps = {
  leftIcon?: React.ReactElement
  rightIcon?: React.ReactElement,
  containerStyle?: ViewStyle
} & TextInputProps

function AppInput(props: AppInputProps) {
  const { leftIcon, rightIcon, containerStyle, ...rest } = props;
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      ...(containerStyle ?? {})
    }}>
      {leftIcon ?? null}
      <TextInput
        {...rest}
      />
      {rightIcon ?? null}
    </View>
  );
}

export default AppInput;
