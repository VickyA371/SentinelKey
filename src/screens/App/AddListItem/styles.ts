import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
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
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedTeal,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputContainer: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.iceGray,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.charcoal,
  },
  categoryPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.iceGray,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  erroredPicker: {
    borderColor: 'red',
  },
  categoryValue: {
    fontSize: 16,
    color: colors.deepTeal,
  },
  placeholderText: {
    color: colors.mutedBlueGray,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.iceGray,
    backgroundColor: colors.white,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.deepTeal,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.offWhiteBlueGray,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.deepTeal,
    // Add shadow
    shadowColor: colors.deepTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addItemButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
});

export default styles;
