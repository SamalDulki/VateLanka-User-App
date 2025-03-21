import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  COLORS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_LABELS,
} from "./Constants";
import CustomText from "./CustomText";
import Icon from "react-native-vector-icons/MaterialIcons";

const TicketItem = ({ ticket, onPress }) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyle = (status) => {
    return {
      backgroundColor: TICKET_STATUS_COLORS[status] || COLORS.textGray,
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "schedule";
      case "assigned":
        return "local-shipping";
      case "resolved":
        return "check-circle";
      case "cancelled":
        return "cancel";
      default:
        return "help";
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(ticket)}>
      <View style={[styles.statusIndicator, getStatusStyle(ticket.status)]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <CustomText style={styles.issueType}>{ticket.issueType}</CustomText>
          <View style={styles.statusContainer}>
            <Icon
              name={getStatusIcon(ticket.status)}
              size={16}
              color={TICKET_STATUS_COLORS[ticket.status] || COLORS.textGray}
            />
            <CustomText
              style={[
                styles.statusText,
                {
                  color: TICKET_STATUS_COLORS[ticket.status] || COLORS.textGray,
                },
              ]}
            >
              {TICKET_STATUS_LABELS[ticket.status] || "Unknown"}
            </CustomText>
          </View>
        </View>

        <View style={styles.wasteTypeContainer}>
          <Icon
            name={
              ticket.wasteType === "Degradable"
                ? "delete-outline"
                : ticket.wasteType === "Recyclable"
                ? "replay"
                : "delete-forever"
            }
            size={16}
            color={COLORS.textGray}
          />
          <CustomText style={styles.wasteType}>{ticket.wasteType}</CustomText>
        </View>

        {ticket.notes && (
          <CustomText style={styles.notes} numberOfLines={2}>
            {ticket.notes}
          </CustomText>
        )}

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Icon name="event" size={14} color={COLORS.textGray} />
            <CustomText style={styles.timeText}>
              {formatDate(ticket.createdAt)}
            </CustomText>
          </View>

          {ticket.status === "resolved" && ticket.resolvedAt && (
            <View style={styles.timeContainer}>
              <Icon name="check" size={14} color={COLORS.textGray} />
              <CustomText style={styles.timeText}>
                {formatDate(ticket.resolvedAt)}
              </CustomText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicator: {
    width: 8,
    backgroundColor: COLORS.textGray,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  issueType: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  wasteTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  wasteType: {
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 6,
  },
  notes: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textGray,
    marginLeft: 4,
  },
});

export default TicketItem;
