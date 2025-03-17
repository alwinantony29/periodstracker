import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CycleData, PeriodLog } from "@/types";
import {
  isCycleLengthNormal,
  isPeriodLengthNormal,
  isIrregularCycle,
} from "@/ utils/cycleCalculations";

const InsightsScreen = () => {
  const [cycleData, setCycleData] = useState<CycleData>({
    periodLogs: [],
    averageCycleLength: 28,
    averagePeriodLength: 5,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCycleData();
  }, []);

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

  const getCycleLengths = (): number[] => {
    const lengths: number[] = [];
    const logs = [...cycleData.periodLogs].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    for (let i = 1; i < logs.length; i++) {
      const current = new Date(logs[i].startDate);
      const previous = new Date(logs[i - 1].startDate);
      const diff = Math.round(
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff > 0 && diff < 60) {
        // Ignore outliers
        lengths.push(diff);
      }
    }

    return lengths;
  };

  const getPeriodLengths = (): number[] => {
    const lengths: number[] = [];

    for (const log of cycleData.periodLogs) {
      if (log.endDate) {
        const start = new Date(log.startDate);
        const end = new Date(log.endDate);
        const diff =
          Math.round(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;

        if (diff > 0 && diff < 15) {
          // Ignore outliers
          lengths.push(diff);
        }
      }
    }

    return lengths;
  };

  const getNextThreePeriods = (): Date[] => {
    if (cycleData.periodLogs.length === 0) return [];

    const lastPeriod = new Date(
      cycleData.periodLogs[cycleData.periodLogs.length - 1].startDate
    );
    const predictions: Date[] = [];

    for (let i = 1; i <= 3; i++) {
      const nextDate = new Date(lastPeriod);
      nextDate.setDate(nextDate.getDate() + cycleData.averageCycleLength * i);
      predictions.push(nextDate);
    }

    return predictions;
  };

  const renderInsightCard = (
    title: string,
    value: string,
    description: string,
    icon: string,
    color: string
  ) => (
    <View style={styles.insightCard}>
      <View style={[styles.insightIconContainer, { backgroundColor: color }]}>
        <Feather name={icon as any} size={20} color="#FFF" />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightValue}>{value}</Text>
        <Text style={styles.insightDescription}>{description}</Text>
      </View>
    </View>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading your insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cycleData.periodLogs.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="bar-chart-2" size={48} color="#999" />
          <Text style={styles.emptyText}>
            Log at least two periods to see insights about your cycle
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const cycleLengths = getCycleLengths();
  const periodLengths = getPeriodLengths();
  const nextPeriods = getNextThreePeriods();
  const cycleRegularity = isIrregularCycle(cycleLengths)
    ? "Irregular"
    : "Regular";
  const cycleNormality = isCycleLengthNormal(cycleData.averageCycleLength)
    ? "Normal"
    : "Unusual";
  const periodNormality = isPeriodLengthNormal(cycleData.averagePeriodLength)
    ? "Normal"
    : "Unusual";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Analysis</Text>

          {renderInsightCard(
            "Cycle Length",
            `${cycleData.averageCycleLength} days`,
            `Your cycles are ${cycleNormality.toLowerCase()}. Most cycles range from 21-35 days.`,
            "calendar",
            "#FF6B8B"
          )}

          {renderInsightCard(
            "Period Duration",
            `${cycleData.averagePeriodLength} days`,
            `Your periods are ${periodNormality.toLowerCase()}. Most periods last 3-7 days.`,
            "clock",
            "#7C5DFA"
          )}

          {renderInsightCard(
            "Cycle Regularity",
            cycleRegularity,
            cycleRegularity === "Regular"
              ? "Your cycles have consistent length between periods."
              : "Your cycles vary by more than 7 days between periods.",
            "activity",
            cycleRegularity === "Regular" ? "#4CAF50" : "#FFC107"
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Periods</Text>

          {nextPeriods.map((date, index) => (
            <View key={index} style={styles.predictionItem}>
              <View style={styles.predictionDot} />
              <Text style={styles.predictionText}>{formatDate(date)}</Text>
            </View>
          ))}
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
  scrollContainer: {
    flex: 1,
  },
  section: {
    padding: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: "#666",
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  predictionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF6B8B",
    marginRight: 12,
  },
  predictionText: {
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
});

export default InsightsScreen;
