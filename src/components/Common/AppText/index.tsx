import React from "react";
import { Text, TextProps } from 'react-native';
import colors from "../../../constants/colors";

type AppTextPropTypes = {
  erroredText?: boolean
} & TextProps;

function AppText(props: AppTextPropTypes) {
  const { erroredText } = props;

  return (
    <Text
      {...props}
      style={{
        fontSize: 12,
        color: erroredText
          ? colors.red
          : colors.black,
        marginBottom: props.style?.marginBottom ?? erroredText ? 10 : 0, // maintain bottom margin when there is an error
        marginLeft: props.style?.marginLeft ?? erroredText ? 10 : 0, // left spacing is for border radius
        ...props.style
      }}
    />
  );
}

export default AppText;
