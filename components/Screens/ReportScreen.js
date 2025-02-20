import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <MaterialIcons name="description" size={48} color={COLORS.textGray} />
    <CustomText style={styles.emptyStateTitle}>No Reports Yet</CustomText>
    <CustomText style={styles.emptyStateText}>
      Your submitted reports will appear here
    </CustomText>
  </View>
);

const CreateReportModal = ({ visible, onClose, onSubmit }) => {
  const [reportText, setReportText] = useState("");

  const handleSubmit = () => {
    if (reportText.trim()) {
      onSubmit(reportText);
      setReportText("");
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <CustomText style={styles.modalTitle}>
                  Create New Report
                </CustomText>
                <TouchableOpacity onPress={onClose}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={COLORS.textGray}
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                placeholder="Describe your report..."
                value={reportText}
                onChangeText={setReportText}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <MaterialIcons name="send" size={20} color={COLORS.white} />
                <CustomText style={styles.buttonText}>Submit Report</CustomText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export function ReportScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [reports, setReports] = useState([]);

  const handleCreateReport = (reportText) => {
    const newReport = {
      id: Date.now(),
      text: reportText,
      time: "Just now",
      status: "pending",
    };
    setReports((prevReports) => [newReport, ...prevReports]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <CustomText style={styles.heading}>Report Issues</CustomText>
          <CustomText style={styles.subtitle}>
            Submit your concerns to supervisors
          </CustomText>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <CustomText style={styles.createButtonText}>
            + Create New Report
          </CustomText>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {reports.length === 0 ? (
            <EmptyState />
          ) : (
            reports.map((report) => (
              <TouchableOpacity key={report.id} style={styles.card}>
                <MaterialIcons
                  name="description"
                  size={24}
                  color={COLORS.primary}
                />
                <View style={styles.cardContent}>
                  <CustomText style={styles.cardTitle} numberOfLines={2}>
                    {report.text}
                  </CustomText>
                  <View style={styles.statusContainer}>
                    <CustomText style={styles.cardTime}>
                      {report.time}
                    </CustomText>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            report.status === "pending"
                              ? COLORS.error
                              : COLORS.primary,
                        },
                      ]}
                    />
                    <CustomText style={styles.statusText}>
                      {report.status.charAt(0).toUpperCase() +
                        report.status.slice(1)}
                    </CustomText>
                  </View>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textGray}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <CreateReportModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleCreateReport}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flex: 1,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textGray,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.black,
  },
  cardTime: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.black,
  },
  input: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});

export default ReportScreen;
