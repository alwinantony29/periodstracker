import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { PeriodLog } from "../types";

interface LogPeriodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (log: PeriodLog) => void;
  lastPeriod: PeriodLog | null;
}

const FLOW_OPTIONS = [
  { id: "light", label: "Light", icon: "droplet" },
  { id: "medium", label: "Medium", icon: "droplet" },
  { id: "heavy", label: "Heavy", icon: "droplet" },
];

const SYMPTOM_OPTIONS = [
  { id: "cramps", label: "Cramps", icon: "activity" },
  { id: "headache", label: "Headache", icon: "frown" },
  { id: "bloating", label: "Bloating", icon: "wind" },
  { id: "fatigue", label: "Fatigue", icon: "battery" },
  { id: "mood", label: "Mood Swings", icon: "refresh-cw" },
  { id: "acne", label: "Acne", icon: "alert-circle" },
  { id: "backache", label: "Backache", icon: "thermometer" },
  { id: "tender", label: "Tender Breasts", icon: "heart" },
];

export const LogPeriodModal = ({
  visible,
  onClose,
  onSave,
  lastPeriod,
}: LogPeriodModalProps) => {
  const [isStarting, setIsStarting] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setSelectedDate(new Date());
      setSelectedFlow(null);
      setSelectedSymptoms([]);

      // Determine if we're starting or ending a period
      if (lastPeriod && !lastPeriod.endDate) {
        setIsStarting(false);
      } else {
        setIsStarting(true);
      }
    }
  }, [visible, lastPeriod]);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);

    // Don't allow future dates
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter((id) => id !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
  };

  const handleSave = () => {
    const log: PeriodLog = {
      startDate: isStarting
        ? selectedDate.toISOString()
        : lastPeriod?.startDate || selectedDate.toISOString(),
      endDate: isStarting ? null : selectedDate.toISOString(),
      flow: selectedFlow || "medium",
      symptoms: selectedSymptoms,
    };

    onSave(log);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {isStarting ? "Log Period Start" : "Log Period End"}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.dateSelector}>
                  <Text style={styles.sectionTitle}>
                    {isStarting
                      ? "When did your period start?"
                      : "When did your period end?"}
                  </Text>

                  <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                      onPress={() => handleDateChange(-1)}
                      style={styles.dateArrow}
                    >
                      <Feather name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.dateDisplay}>
                      <Text style={styles.dateText}>
                        {formatDate(selectedDate)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDateChange(1)}
                      style={styles.dateArrow}
                    >
                      <Feather name="chevron-right" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.flowSelector}>
                  <Text style={styles.sectionTitle}>Flow Intensity</Text>
                  <View style={styles.flowOptions}>
                    {FLOW_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.flowOption,
                          selectedFlow === option.id &&
                            styles.selectedFlowOption,
                        ]}
                        onPress={() => setSelectedFlow(option.id)}
                      >
                        <Feather
                          name={option.icon as any}
                          size={20}
                          color={
                            selectedFlow === option.id ? "#FFF" : "#FF6B8B"
                          }
                        />
                        <Text
                          style={[
                            styles.flowOptionText,
                            selectedFlow === option.id &&
                              styles.selectedFlowOptionText,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.symptomsSelector}>
                  <Text style={styles.sectionTitle}>Symptoms</Text>
                  <View style={styles.symptomsGrid}>
                    {SYMPTOM_OPTIONS.map((symptom) => (
                      <TouchableOpacity
                        key={symptom.id}
                        style={[
                          styles.symptomOption,
                          selectedSymptoms.includes(symptom.id) &&
                            styles.selectedSymptomOption,
                        ]}
                        onPress={() => toggleSymptom(symptom.id)}
                      >
                        <Feather
                          name={symptom.icon as any}
                          size={18}
                          color={
                            selectedSymptoms.includes(symptom.id)
                              ? "#FFF"
                              : "#666"
                          }
                        />
                        <Text
                          style={[
                            styles.symptomText,
                            selectedSymptoms.includes(symptom.id) &&
                              styles.selectedSymptomText,
                          ]}
                        >
                          {symptom.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  dateSelector: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateArrow: {
    padding: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  flowSelector: {
    padding: 24,
    paddingTop: 0,
  },
  flowOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flowOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0E6",
    backgroundColor: "#FFF",
  },
  selectedFlowOption: {
    backgroundColor: "#FF6B8B",
    borderColor: "#FF6B8B",
  },
  flowOptionText: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
  },
  selectedFlowOptionText: {
    color: "#FFF",
  },
  symptomsSelector: {
    padding: 24,
    paddingTop: 0,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  symptomOption: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: "1%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    backgroundColor: "#FFF",
  },
  selectedSymptomOption: {
    backgroundColor: "#7C5DFA",
    borderColor: "#7C5DFA",
  },
  symptomText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  selectedSymptomText: {
    color: "#FFF",
  },
  saveButton: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: "#FF6B8B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
