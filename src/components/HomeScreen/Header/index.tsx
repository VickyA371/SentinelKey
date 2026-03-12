import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useDispatch } from "react-redux";
import { getAuth, signOut } from '@react-native-firebase/auth'

// components
import AppText from "../../Common/AppText";

// constants
import colors from "../../../constants/colors";

// redux
import { clearData } from "../../../store/slices/authSlice";

const Header = () => {
  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      await signOut(getAuth())
      dispatch(clearData())
    } catch (_: unknown) {
      dispatch(clearData())
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={colors.deepTeal}
            />
        </View>
        <AppText style={styles.title}>{"Sentinel Key"}</AppText>
      </View>
      <TouchableOpacity onPress={logoutHandler}>
        <Ionicons 
          name="person-circle-outline"
          size={28}
          color={colors.deepTeal}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: colors.lightCyanBlue,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.charcoal,
  },
});
