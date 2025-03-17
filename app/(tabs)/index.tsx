import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "@/components/Calender";
import { StatusBar } from "expo-status-bar";
import { CycleStatusCard } from "@/components/CycleStatusCard";
import { LogPeriodModal } from "@/components/LogPeriodModal";
import {
  calculateNextPeriod,
  calculateFertileWindow,
  calculateCyclePhase,
} from "@/ utils/cycleCalculations";
import { CycleData, PeriodLog } from "@/types";
import { useRouter } from "expo-router";
import { OnboardingModal } from "@/components/OnboardingModal";

const HomeScreen = () => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [cycleData, setCycleData] = useState<CycleData>({
    periodLogs: [],
    averageCycleLength: 28,
    averagePeriodLength: 5,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  const router = useRouter();

  useEffect(() => {
    loadCycleData();
  }, []);

  useEffect(() => {
    if (cycleData.periodLogs.length > 0) {
      updateMarkedDates();
      saveCycleData();
    }
  }, [cycleData]);

  const loadCycleData = async () => {
    try {
      const data = await AsyncStorage.getItem("cycleData");
      if (data) {
        setCycleData(JSON.parse(data));
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading cycle data:", error);
      setIsLoading(false);
    }
  };

  const saveCycleData = async () => {
    try {
      await AsyncStorage.setItem("cycleData", JSON.stringify(cycleData));
    } catch (error) {
      console.error("Error saving cycle data:", error);
    }
  };

  const updateMarkedDates = () => {
    const dates = {} as Record<
      string,
      {
        selected: boolean;
        selectedColor: string;
        marked: boolean;
        dotColor: string;
      }
    >;

    // Mark period days
    cycleData.periodLogs.forEach((log) => {
      const startDate = new Date(log.startDate);
      const endDate = log.endDate ? new Date(log.endDate) : new Date(startDate);

      if (log.endDate) {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateString = currentDate.toISOString().split("T")[0];
          dates[dateString] = {
            selected: true,
            selectedColor: "#FF6B8B",
            marked: true,
            dotColor: "#FF6B8B",
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        const dateString = startDate.toISOString().split("T")[0];
        dates[dateString] = {
          selected: true,
          selectedColor: "#FF6B8B",
          marked: true,
          dotColor: "#FF6B8B",
        };
      }
    });

    // Mark fertile window
    if (cycleData.periodLogs.length > 0) {
      const lastPeriod = cycleData.periodLogs[cycleData.periodLogs.length - 1];
      const fertileWindow = calculateFertileWindow(
        new Date(lastPeriod.startDate),
        cycleData.averageCycleLength
      );

      if (fertileWindow) {
        let currentDate = new Date(fertileWindow.start);
        while (currentDate <= fertileWindow.end) {
          const dateString = currentDate.toISOString().split("T")[0];
          if (!dates[dateString]) {
            dates[dateString] = {
              selected: true,
              selectedColor: "#7C5DFA",
              marked: true,
              dotColor: "#7C5DFA",
            };
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    setMarkedDates(dates);
  };

  const handleLogPeriod = (log: PeriodLog) => {
    const updatedLogs = [...cycleData.periodLogs];

    if (log.endDate && updatedLogs.length > 0) {
      // If this is an end date for the current period
      const lastLog = updatedLogs[updatedLogs.length - 1];
      if (!lastLog.endDate) {
        lastLog.endDate = log.endDate;
        lastLog.symptoms = log.symptoms;
        lastLog.flow = log.flow;
      }
    } else {
      // New period start
      updatedLogs.push(log);
    }

    // Calculate average cycle length if we have at least 2 periods
    let avgCycleLength = cycleData.averageCycleLength;
    if (updatedLogs.length >= 2) {
      let totalDays = 0;
      let count = 0;

      for (let i = 1; i < updatedLogs.length; i++) {
        const current = new Date(updatedLogs[i].startDate);
        const previous = new Date(updatedLogs[i - 1].startDate);
        const diff = Math.round(
          (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff > 0 && diff < 60) {
          // Ignore outliers
          totalDays += diff;
          count++;
        }
      }

      if (count > 0) {
        avgCycleLength = Math.round(totalDays / count);
      }
    }

    // Calculate average period length
    let avgPeriodLength = cycleData.averagePeriodLength;
    if (updatedLogs.length > 0) {
      let totalDays = 0;
      let count = 0;

      for (const log of updatedLogs) {
        if (log.endDate) {
          const start = new Date(log.startDate);
          const end = new Date(log.endDate);
          const diff =
            Math.round(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

          if (diff > 0 && diff < 15) {
            // Ignore outliers
            totalDays += diff;
            count++;
          }
        }
      }

      if (count > 0) {
        avgPeriodLength = Math.round(totalDays / count);
      }
    }

    setCycleData({
      periodLogs: updatedLogs,
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
    });

    setShowLogModal(false);
  };

  const getCurrentCycleInfo = () => {
    if (cycleData.periodLogs.length === 0) {
      return {
        daysUntilNextPeriod: null,
        currentPhase: "Not enough data",
        nextPeriodDate: null,
        cycleDay: null,
      };
    }

    const lastPeriod = cycleData.periodLogs[cycleData.periodLogs.length - 1];
    const lastPeriodStart = new Date(lastPeriod.startDate);
    const today = new Date();

    // Check if currently on period
    if (!lastPeriod.endDate) {
      const daysSinceStart = Math.floor(
        (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceStart < cycleData.averagePeriodLength) {
        return {
          daysUntilNextPeriod: 0,
          currentPhase: "Period",
          nextPeriodDate: null,
          cycleDay: daysSinceStart + 1,
        };
      }
    }

    const nextPeriod = calculateNextPeriod(
      lastPeriodStart,
      cycleData.averageCycleLength
    );
    const daysUntil = Math.ceil(
      (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const cycleDay =
      Math.floor(
        (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const phase = calculateCyclePhase(cycleDay, cycleData.averageCycleLength);

    return {
      daysUntilNextPeriod: daysUntil,
      currentPhase: phase,
      nextPeriodDate: nextPeriod,
      cycleDay: cycleDay,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Period Tracker</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              router.push("/settings");
            }}
          >
            <Feather name="settings" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <CycleStatusCard cycleInfo={getCurrentCycleInfo()} />

        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Calendar</Text>
          <Calendar markedDates={markedDates} />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FF6B8B" }]} />
            <Text style={styles.legendText}>Period</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#7C5DFA" }]} />
            <Text style={styles.legendText}>Fertile Window</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.logButton}
        onPress={() => setShowLogModal(true)}
      >
        <Feather name="plus" size={24} color="#FFF" />
        <Text style={styles.logButtonText}>Log Period</Text>
      </TouchableOpacity>

      <LogPeriodModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSave={handleLogPeriod}
        lastPeriod={
          cycleData.periodLogs.length > 0
            ? cycleData.periodLogs[cycleData.periodLogs.length - 1]
            : null
        }
      />
      <OnboardingModal
        onComplete={() => {
          console.log("onboarding completed");
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
  },
  calendarContainer: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  legendContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 100,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 14,
    color: "#666",
  },
  logButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#FF6B8B",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default HomeScreen;
