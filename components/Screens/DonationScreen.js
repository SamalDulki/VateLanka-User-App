import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";

const DonationScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  const subtitles = [
    "Help save young hearts and brave lives",
    "Protecting nature, one step at a time",
    "Reduce. Reuse. Rethink.",
    "Powering a greener tomorrow"
  ];

  const tileContentSets = [
    [
      {
        id: 1,
        image: require("../../assets/donation.jpg"),
        title: "Why Donate?",
        text: "Your support helps fund life-saving treatments and essential medical care for those in need, including children born with heart conditions and cancer patients relying on free public healthcare. Every donation brings hope, healing, and a second chance at life."
      },
      {
        id: 2,
        image: require("../../assets/donation2.jpg"),
        title: "Where Your Donation Goes",
        text: "Your donation directly supports two of Sri Lanka's most vital healthcare causes — the Little Hearts Fund, which is building a cardiac and critical care unit for children in need of life-saving heart treatment, and the National Cancer Hospital, which provides free cancer care to thousands of patients.\n\nEvery contribution helps purchase essential medical equipment, improve hospital infrastructure, and ensure that children and cancer patients receive the urgent care they deserve."
      }
    ],
    [
      {
        id: 1,
        image: require("../../assets/clean_earth.jpg"),
        title: "Protect Our Planet",
        text: "Every small action counts. From reducing plastic use to supporting clean-up drives, your contributions help preserve nature for future generations. Join us in building a greener tomorrow."
      },
      {
        id: 2,
        image: require("../../assets/tree_planting.jpg"), 
        title: "Reforest Sri Lanka",
        text: "We aim to plant 10,000 trees across deforested and urban areas in Sri Lanka. Your donation supports tree-planting programs, community education, and green infrastructure initiatives."
      }
    ],
    [
      {
        id: 1,
        image: require("../../assets/recycling.jpg"),
        title: "Support Recycling Efforts",
        text: "We partner with local communities to establish recycling centers and run awareness campaigns about proper waste segregation. Help us reduce landfill waste and promote a circular economy."
      },
      {
        id: 2,
        image: require("../../assets/zero_waste.jpg"),
        title: "Go Zero Waste",
        text: "Your donations fund zero-waste kits, eco-workshops, and education for schools and rural families. Together, we can shift daily habits and create cleaner, healthier neighborhoods."
      }
    ],
    [
      {
        id: 1,
        image: require("../../assets/solar_panels.jpg"),
        title: "Bring Solar to Rural Schools",
        text: "We're installing solar panels in underprivileged schools to reduce electricity costs and promote green learning. Your donation helps fund equipment and training for a brighter, cleaner future."
      },
      {
        id: 2,
        image: require("../../assets/eco_education.jpg"), 
        title: "Educate for a Greener Future",
        text: "Sustainability begins with awareness. Our eco-education program reaches thousands of students, teaching practical skills in conservation, composting, and energy efficiency."
      }
    ]
  ];

  const [donationTiles, setDonationTiles] = useState(tileContentSets[0]);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitles[0]);

  const [isTabPress, setIsTabPress] = useState(false);

  const cycleContent = useCallback(async () => {
    setRefreshing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const nextIndex = (currentContentIndex + 1) % tileContentSets.length;
      setCurrentContentIndex(nextIndex);
      setDonationTiles(tileContentSets[nextIndex]);
      setCurrentSubtitle(subtitles[nextIndex]);
      
    } catch (error) {
      console.error('Error refreshing content:', error);
    } finally {
      setRefreshing(false);
    }
  }, [currentContentIndex, tileContentSets, subtitles]);

  const onRefresh = useCallback(() => {
    cycleContent();
  }, [cycleContent]);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('tabPress', () => {
        setIsTabPress(true);
      });

      return unsubscribe;
    }, [navigation])
  );

  useFocusEffect(
    useCallback(() => {
      if (isTabPress && !refreshing) {
        cycleContent();
        setIsTabPress(false);
      }
    }, [isTabPress, refreshing, cycleContent])
  );

  const renderDonationCard = (tile) => (
    <View key={tile.id} style={styles.card}>
      <Image
        source={tile.image}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <CustomText style={styles.tileTitle}>{tile.title}</CustomText>
        <CustomText style={styles.tileText}>
          {tile.text.includes("Little Hearts Fund") ? (
            <>
              Your donation directly supports two of Sri Lanka's most vital
              healthcare causes — the{" "}
              <CustomText style={{ fontWeight: "bold" }}>
                Little Hearts Fund
              </CustomText>
              , which is building a cardiac and critical care unit for children
              in need of life-saving heart treatment, and the{" "}
              <CustomText style={{ fontWeight: "bold" }}>
                National Cancer Hospital
              </CustomText>
              , which provides free cancer care to thousands of patients.
              {"\n\n"} Every contribution helps purchase essential medical
              equipment, improve hospital infrastructure, and ensure that
              children and cancer patients receive the urgent care they deserve.
            </>
          ) : (
            tile.text
          )}
        </CustomText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.heading}>Donations</CustomText>
        <CustomText style={styles.subtitle}>
          {currentSubtitle}
        </CustomText>
      </View>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]} // Android
            tintColor={COLORS.primary} // iOS
          />
        }
      >
        {donationTiles.map(renderDonationCard)}

        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => navigation.navigate("Donations")}
        >
          <CustomText style={styles.donateButtonText}>Donate Now</CustomText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  content: {
    padding: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 50,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 435,
    borderRadius: 12,
  },
  cardBody: {
    padding: 15,
  },
  tile: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 6,
  },
  tileText: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  donateButton: {
    marginTop: -25,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  donateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DonationScreen;