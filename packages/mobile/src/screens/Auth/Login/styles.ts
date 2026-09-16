import { StyleSheet } from "react-native";
import { colors } from '@sentinelkey/shared';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBlueGray,
    paddingHorizontal: 20,
    justifyContent: 'center',
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgot: {
    color: colors.deepTeal,
    fontSize: 13,
  },
  biometricButton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.iceGray,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  biometricText: {
    color: colors.deepTeal,
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.mutedTeal,
  },
  createAccount: {
    color: colors.deepTeal,
    fontWeight: '600',
  },
});

export default styles;
