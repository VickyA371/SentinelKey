import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// components
import AppText from "../../Common/AppText";

// constants
import colors from "../../../constants/colors";

const CATEGORIES = ["All", "Social", "Finance", "Work", "Personal"];

const CategoryTabs = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.tab,
                isActive && styles.activeTab,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <AppText
                style={[
                  styles.tabText,
                  isActive && styles.activeTabText,
                ]}
              >
                {category}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryTabs;

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.white,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.lightCoolGray,
  },
  activeTab: {
    backgroundColor: colors.deepTeal,
    borderColor: colors.deepTeal,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.mutedTeal,
  },
  activeTabText: {
    color: colors.white,
  },
});