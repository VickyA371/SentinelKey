import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
});

export default styles;
