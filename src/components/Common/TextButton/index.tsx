import React from "react";
import { TextStyle, TouchableOpacity } from 'react-native';

// components
import AppText from "../AppText";

type TextButtonPropTypes = {
  textStyle?: TextStyle
  btnText: string
  onPress: () => unknown
  disabled?: boolean
}

function TextButton(props: TextButtonPropTypes) {
  const { 
    textStyle,
    btnText,
    onPress,
    disabled
  } = props;

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <AppText style={{
        fontSize: 13,
        ...(textStyle ?? {})
      }}>{btnText}</AppText>
    </TouchableOpacity>
  );
}

export default TextButton;
