import { StyleSheet } from 'react-native';
import colors from '../../../constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBlueGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.offWhiteBlueGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    padding: 20,
  },
  iconWrapper: {
    alignSelf: 'center',
    backgroundColor: colors.lightCyanBlue,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.charcoal,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.mutedBlueGray,
    marginTop: 8,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
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
  inputContainerDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.iceGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 15,
    backgroundColor: colors.iceGray, // darker background to indicate disabled
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.charcoal,
  },
  inputDisabled: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.mutedBlueGray,
  },
  button: {
    backgroundColor: colors.deepTeal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
