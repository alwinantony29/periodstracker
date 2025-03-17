import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReminderSettings, UserPreferences } from "@/types";

const SettingsScreen = () => {
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    periodReminder: true,
    periodReminderDays: 2,
    ovulationReminder: true,
    medicationReminder: false,
    medicationTimes: [],
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    useLocalStorageOnly: true,
    showFertileWindow: true,
    showPredictions: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const reminderData = await AsyncStorage.getItem("reminderSettings");
      if (reminderData) {
        setReminderSettings(JSON.parse(reminderData));
      }

      const preferencesData = await AsyncStorage.getItem("userPreferences");
      if (preferencesData) {
        setPreferences(JSON.parse(preferencesData));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveReminderSettings = async (settings: ReminderSettings) => {
    try {
      await AsyncStorage.setItem("reminderSettings", JSON.stringify(settings));
      setReminderSettings(settings);
    } catch (error) {
      console.error("Error saving reminder settings:", error);
    }
  };

  const savePreferences = async (prefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem("userPreferences", JSON.stringify(prefs));
      setPreferences(prefs);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const handleToggleReminder = (key: keyof ReminderSettings) => {
    const updatedSettings = {
      ...reminderSettings,
      [key]: !reminderSettings[key],
    };
    saveReminderSettings(updatedSettings);
  };

  const handleTogglePreference = (key: keyof UserPreferences) => {
    if (typeof preferences[key] === "boolean") {
      const updatedPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };
      savePreferences(updatedPreferences);
    }
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    const updatedPreferences = { ...preferences, theme };
    savePreferences(updatedPreferences);
  };

  const handleExportData = async () => {
    try {
      const cycleData = await AsyncStorage.getItem("cycleData");
      const reminderData = await AsyncStorage.getItem("reminderSettings");
      const preferencesData = await AsyncStorage.getItem("userPreferences");

      const exportData = {
        cycleData: cycleData ? JSON.parse(cycleData) : null,
        reminderSettings: reminderData ? JSON.parse(reminderData) : null,
        userPreferences: preferencesData ? JSON.parse(preferencesData) : null,
        exportDate: new Date().toISOString(),
      };

      // In a real app, we would save this to a file or share it
      Alert.alert("Data Exported", "Your data has been exported successfully.");
      console.log("Exported data:", JSON.stringify(exportData));
    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert("Export Failed", "There was an error exporting your data.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all your data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "cycleData",
                "reminderSettings",
                "userPreferences",
              ]);

              // Reset to defaults
              setReminderSettings({
                periodReminder: true,
                periodReminderDays: 2,
                ovulationReminder: true,
                medicationReminder: false,
                medicationTimes: [],
              });

              setPreferences({
                theme: "light",
                useLocalStorageOnly: true,
                showFertileWindow: true,
                showPredictions: true,
              });

              Alert.alert(
                "Data Cleared",
                "All your data has been cleared successfully."
              );
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "There was an error clearing your data.");
            }
          },
        },
      ]
    );
  };

  const renderSettingSwitch = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#E0E0E0", true: "#FFE0E6" }}
        thumbColor={value ? "#FF6B8B" : "#FFF"}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>

          {renderSettingSwitch(
            "Period Reminders",
            "Get notified before your period starts",
            reminderSettings.periodReminder,
            () => handleToggleReminder("periodReminder")
          )}

          {renderSettingSwitch(
            "Ovulation Reminders",
            "Get notified during your fertile window",
            reminderSettings.ovulationReminder,
            () => handleToggleReminder("ovulationReminder")
          )}

          {renderSettingSwitch(
            "Medication Reminders",
            "Get reminders to take your medication",
            reminderSettings.medicationReminder,
            () => handleToggleReminder("medicationReminder")
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.themeSelector}>
            <Text style={styles.settingTitle}>Theme</Text>
            <View style={styles.themeOptions}>
              {(["light", "dark", "system"] as const).map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeOption,
                    preferences.theme === theme && styles.selectedThemeOption,
                  ]}
                  onPress={() => handleThemeChange(theme)}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      preferences.theme === theme &&
                        styles.selectedThemeOptionText,
                    ]}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {renderSettingSwitch(
            "Show Fertile Window",
            "Display fertile days on the calendar",
            preferences.showFertileWindow,
            () => handleTogglePreference("showFertileWindow")
          )}

          {renderSettingSwitch(
            "Show Predictions",
            "Display predicted periods on the calendar",
            preferences.showPredictions,
            () => handleTogglePreference("showPredictions")
          )}

          {renderSettingSwitch(
            "Store Data Locally Only",
            "Keep your data on this device only",
            preferences.useLocalStorageOnly,
            () => handleTogglePreference("useLocalStorageOnly")
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={styles.dataButton}
            onPress={handleExportData}
          >
            <Feather name="download" size={20} color="#333" />
            <Text style={styles.dataButtonText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButton} onPress={handleClearData}>
            <Feather name="trash-2" size={20} color="#FF6B8B" />
            <Text style={[styles.dataButtonText, { color: "#FF6B8B" }]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.versionText}>Period Tracker v1.0.0</Text>
          <Text style={styles.privacyText}>
            Your data is stored locally on your device. We respect your privacy
            and do not share your information.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  section: {
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  themeSelector: {
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: "row",
    marginTop: 8,
  },
  themeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
  },
  selectedThemeOption: {
    backgroundColor: "#FF6B8B",
    borderColor: "#FF6B8B",
  },
  themeOptionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedThemeOptionText: {
    color: "#FFF",
  },
  dataButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  dataButtonText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  versionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default SettingsScreen;
