import React from "react";
import { StyleSheet, Text, TextProps } from 'react-native';
import colors from "../../../constants/colors";

type AppTextPropTypes = {
  erroredText?: boolean
} & TextProps;

function AppText(props: AppTextPropTypes) {
  const { erroredText } = props;

  const flattenStyle = StyleSheet.flatten(props.style)

  return (
    <Text
      {...props}
      style={[
        {
          fontSize: 12,
          color: erroredText
            ? colors.red
            : colors.black,
          marginBottom: flattenStyle?.marginBottom ?? erroredText ? 10 : 0, // maintain bottom margin when there is an error
          marginLeft: flattenStyle?.marginLeft ?? erroredText ? 10 : 0, // left spacing is for border radius
        }, flattenStyle]}
    />
  );
}

export default AppText;
