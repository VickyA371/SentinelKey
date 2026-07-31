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
  /**
   * Optional controlled reveal. When provided, the parent owns whether the text
   * is visible (true = plaintext) and is notified via `onToggleSecure` when the
   * eye is tapped — letting it gate the reveal (e.g. behind a master password).
   * When omitted, AppInput manages the toggle internally (default behaviour).
   */
  secureVisible?: boolean
  onToggleSecure?: (nextVisible: boolean) => void
} & TextInputProps

function AppInput(props: AppInputProps) {
  const {
    ref,
    leftIcon,
    rightIcon,
    containerStyle,
    error,
    securedText,
    secureVisible,
    onToggleSecure,
    ...rest
  } = props;

  const [internalSecureEntry, setInternalSecureEntry] = useState(securedText ?? false)

  const isControlled = secureVisible !== undefined;
  // secureTextEntry === true means the text is MASKED.
  const secureTextEntry = isControlled ? !secureVisible : internalSecureEntry;

  const handleToggleSecure = () => {
    if (isControlled) {
      onToggleSecure?.(!secureVisible); // request the next visibility from the parent
    } else {
      setInternalSecureEntry(prevState => !prevState);
    }
  };

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
          <TouchableOpacity onPress={handleToggleSecure}>
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
    borderColor: colors.red,
    marginBottom: 5
  }
})

export default AppInput;
