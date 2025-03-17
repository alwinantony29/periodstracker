import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface CycleInfo {
  daysUntilNextPeriod: number | null;
  currentPhase: string;
  nextPeriodDate: Date | null;
  cycleDay: number | null;
}

interface CycleStatusCardProps {
  cycleInfo: CycleInfo;
}

export const CycleStatusCard = ({ cycleInfo }: CycleStatusCardProps) => {
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "Period":
        return "droplet";
      case "Follicular":
        return "sun";
      case "Ovulation":
        return "target";
      case "Luteal":
        return "moon";
      default:
        return "help-circle";
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "Period":
        return "#FF6B8B";
      case "Follicular":
        return "#FFC107";
      case "Ovulation":
        return "#7C5DFA";
      case "Luteal":
        return "#4CAF50";
      default:
        return "#999";
    }
  };

  const getFormattedDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const renderStatusContent = () => {
    if (!cycleInfo.cycleDay) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="calendar" size={32} color="#999" />
          <Text style={styles.emptyStateText}>
            Log your period to see predictions
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.phaseContainer}>
          <View
            style={[
              styles.phaseIconContainer,
              { backgroundColor: getPhaseColor(cycleInfo.currentPhase) },
            ]}
          >
            <Feather
              name={getPhaseIcon(cycleInfo.currentPhase)}
              size={20}
              color="#FFF"
            />
          </View>
          <View style={styles.phaseTextContainer}>
            <Text style={styles.phaseLabel}>Current Phase</Text>
            <Text style={styles.phaseText}>{cycleInfo.currentPhase}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cycle Day</Text>
            <Text style={styles.detailValue}>{cycleInfo.cycleDay}</Text>
          </View>

          {cycleInfo.currentPhase !== "Period" &&
            cycleInfo.daysUntilNextPeriod !== null && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Next Period</Text>
                <Text style={styles.detailValue}>
                  {cycleInfo.daysUntilNextPeriod === 0
                    ? "Today"
                    : `In ${cycleInfo.daysUntilNextPeriod} days`}
                </Text>
                <Text style={styles.detailDate}>
                  {getFormattedDate(cycleInfo.nextPeriodDate)}
                </Text>
              </View>
            )}
        </View>
      </>
    );
  };

  return <View style={styles.container}>{renderStatusContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  phaseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  phaseTextContainer: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  detailDate: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
});
