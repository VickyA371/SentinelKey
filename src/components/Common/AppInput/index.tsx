import React, { Ref, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
  type TextInputProps,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';

// components
import AppText from "../AppText";

// constants
import colors from "../../../constants/colors";

type AppInputProps = {
  ref?: Ref<TextInput>
  leftIcon?: React.ReactElement
  rightIcon?: React.ReactElement,
  containerStyle?: ViewStyle | (ViewStyle | false | undefined)[]
  error?: string
  securedText?: boolean
} & TextInputProps

function AppInput(props: AppInputProps) {
  const {
    ref,
    leftIcon,
    rightIcon,
    containerStyle,
    error,
    securedText,
    ...rest
  } = props;

  const [secureTextEntry, setSecureTextEntry] = useState(securedText ?? false)

  return (
    <>
      <View style={[styles.container, containerStyle, error && styles.erroredContainer]}>
        {leftIcon ?? null}
        <TextInput
          {...rest}
          ref={ref}
          secureTextEntry={secureTextEntry}
        />
        {rightIcon ?? securedText ? (
          <TouchableOpacity
            onPress={() => {
              setSecureTextEntry(prevState => !prevState)
            }}>
            <Icon
              name={secureTextEntry ? 'eye' : 'eye-off'}
              size={18}
              color={colors.mutedBlueGray}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error && <AppText erroredText>{error}</AppText>}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  erroredContainer: {
    borderColor: 'red',
    marginBottom: 5
  }
})

export default AppInput;
