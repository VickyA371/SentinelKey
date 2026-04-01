import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AppScreensPropTypes } from "../../../navigation/types";

// components
import AppText from "../../Common/AppText";
import AppHeader from "../../Common/AppHeader";

// constants
import colors from "../../../constants/colors";



const Header = () => {
  const navigation = useNavigation<NavigationProp<AppScreensPropTypes>>();

  const navigateToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <AppHeader
      containerStyle={styles.container}
      showBackButton={false}
      leftContent={
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
      }
      rightContent={
        <TouchableOpacity onPress={navigateToSettings}>
          <Ionicons 
            name="person-circle-outline"
            size={28}
            color={colors.deepTeal}
          />
        </TouchableOpacity>
      }
    />
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
