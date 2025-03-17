import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Period Tracker",
    description:
      "Track your cycle, understand your body, and take control of your health.",
    icon: "heart",
  },
  {
    id: "track",
    title: "Track Your Cycle",
    description:
      "Log your period days, symptoms, and flow to get personalized predictions.",
    icon: "calendar",
  },
  {
    id: "insights",
    title: "Get Insights",
    description:
      "Understand your patterns and receive alerts for irregular cycles.",
    icon: "bar-chart-2",
  },
  {
    id: "privacy",
    title: "Your Privacy Matters",
    description:
      "Your data is stored locally on your device and never shared without your consent.",
    icon: "lock",
  },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(
        "hasCompletedOnboarding"
      );
      if (hasCompletedOnboarding !== "true") {
        setVisible(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setVisible(true);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setVisible(false);
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderStep = ({
    item,
    index,
  }: {
    item: OnboardingStep;
    index: number;
  }) => (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: index % 2 === 0 ? "#FF6B8B" : "#7C5DFA" },
        ]}
      >
        <Feather name={item.icon} size={40} color="#FFF" />
      </View>

      <Text style={styles.stepTitle}>{item.title}</Text>
      <Text style={styles.stepDescription}>{item.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {ONBOARDING_STEPS.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, currentIndex === index && styles.activeDot]}
        />
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* <FlatList
          data={ONBOARDING_STEPS}
          renderItem={renderStep}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / Dimensions.get("window").width
            );
            setCurrentIndex(index);
          }}
          keyExtractor={(item) => item.id}
        /> */}
        {renderStep({
          item: ONBOARDING_STEPS[currentIndex],
          index: currentIndex,
        })}

        {renderDots()}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === ONBOARDING_STEPS.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
          <Feather name="arrow-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 24,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: "#666",
  },
  stepContainer: {
    width,
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FF6B8B",
    width: 16,
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B8B",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
