import React from "react";
import { Text, TextProps } from 'react-native';

function AppText(props: TextProps) {
  return (
    <Text
      style={{ fontSize: 12, ...props.style }}
      {...props}
    />
  );
}

export default AppText;
