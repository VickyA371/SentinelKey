import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBlueGray,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60, // visual balance
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 10,
    color: colors.charcoal,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.iceGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 15,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.charcoal,
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.mutedTeal,
  },
  loginText: {
    color: colors.deepTeal,
    fontWeight: '600',
  },
});

export default styles;
