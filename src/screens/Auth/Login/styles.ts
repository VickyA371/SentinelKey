import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBlueGray,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 16,
    color: colors.deepTeal,
    marginTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoIcon: {
    backgroundColor: colors.deepTeal,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.charcoal,
  },
  card: {
    backgroundColor: colors.lightCoolGray,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    color: colors.charcoal,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedTeal,
    marginTop: 5,
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
