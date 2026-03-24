import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";

interface HelpFaqItemProps {
  question: string;
  answer: string;
}

export const HelpFaqItem = ({ question, answer }: HelpFaqItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <TabBarIcon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={color.primary}
          family="fontawesome"
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  faqItem: {
    backgroundColor: color.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.border,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  faqAnswer: {
    fontSize: 13,
    color: color.textSecondary,
    marginTop: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
});
