import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../utils/firebaseConfig";

// Save user data to Firestore
export const saveUserData = async (uid, userData) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Fetch enabled municipal councils
export const fetchMunicipalCouncils = async () => {
  try {
    const councilsRef = collection(firestore, "municipalCouncils");
    const q = query(councilsRef, where("isEnabled", "==", true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching municipal councils:", error);
    throw error;
  }
};

// Fetch user profile data
export const fetchUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(firestore, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Fetch districts for a municipal council
export const fetchDistrictsForMunicipalCouncil = async (municipalCouncilId) => {
  try {
    const districtRef = collection(
      firestore,
      `municipalCouncils/${municipalCouncilId}/Districts`
    );
    const districtSnapshot = await getDocs(districtRef);
    return districtSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
};

// Fetch wards for a district
export const fetchWardsForDistrict = async (municipalCouncilId, districtId) => {
  try {
    const wardRef = collection(
      firestore,
      `municipalCouncils/${municipalCouncilId}/Districts/${districtId}/Wards`
    );
    const wardSnapshot = await getDocs(wardRef);
    return wardSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching wards:", error);
    throw error;
  }
};

// Update user location
export const updateUserLocation = async (uid, locationData) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      ...locationData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user location:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Fetch Collection Schedules
export const fetchUserSchedules = async (uid) => {
  try {
    const userData = await fetchUserProfile(uid);
    if (!userData?.municipalCouncil || !userData?.district || !userData?.ward) {
      throw new Error("Location not set");
    }

    const schedulesRef = collection(
      firestore,
      `municipalCouncils/${userData.municipalCouncil}/Districts/${userData.district}/Wards/${userData.ward}/schedules`
    );
    const schedulesSnapshot = await getDocs(schedulesRef);

    return schedulesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        wasteType: data.wasteType,
        day: data.day,
        frequency: data.frequency,
        timeSlot: data.timeSlot || null,
      };
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

// Subscribe to all trucks in user's ward
export const subscribeToWardTrucks = async (userData, callback) => {
  if (!userData?.municipalCouncil || !userData?.district || !userData?.ward) {
    throw new Error("User location not set");
  }

  try {
    const wardPath = `municipalCouncils/${userData.municipalCouncil}/Districts/${userData.district}/Wards/${userData.ward}`;

    const supervisorsRef = collection(firestore, `${wardPath}/supervisors`);
    const supervisorsSnapshot = await getDocs(supervisorsRef);

    const unsubscribes = [];

    for (const supervisorDoc of supervisorsSnapshot.docs) {
      const supervisorId = supervisorDoc.id;

      const trucksRef = collection(
        firestore,
        `${wardPath}/supervisors/${supervisorId}/trucks`
      );

      const unsubscribe = onSnapshot(trucksRef, (trucksSnapshot) => {
        const trucksList = trucksSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            supervisorId,
            ...doc.data(),
          }))
          .filter(
            (truck) =>
              truck.routeStatus === "active" || truck.routeStatus === "paused"
          );

        callback(trucksList);
      });

      unsubscribes.push(unsubscribe);
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  } catch (error) {
    console.error("Error subscribing to ward trucks:", error);
    throw error;
  }
};

// Calculate distance between two points (in meters)
export const calculateDistance = (location1, location2) => {
  if (!location1 || !location2) return null;

  const toRadian = (angle) => (Math.PI / 180) * angle;

  const lat1 = location1.latitude;
  const lon1 = location1.longitude;
  const lat2 = location2.latitude;
  const lon2 = location2.longitude;

  const R = 6371e3;
  const φ1 = toRadian(lat1);
  const φ2 = toRadian(lat2);
  const Δφ = toRadian(lat2 - lat1);
  const Δλ = toRadian(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// Create a new ticket
export const createTicket = async (userId, ticketData) => {
  try {
    const userProfile = await fetchUserProfile(userId);

    if (
      !userProfile.municipalCouncil ||
      !userProfile.district ||
      !userProfile.ward
    ) {
      throw new Error("Location not set");
    }

    const ticketsRef = collection(
      firestore,
      `municipalCouncils/${userProfile.municipalCouncil}/Districts/${userProfile.district}/Wards/${userProfile.ward}/tickets`
    );

    const newTicket = {
      userId,
      userName: userProfile.name,
      userEmail: userProfile.email,
      phoneNumber: userProfile.phoneNumber || "",
      homeLocation: userProfile.homeLocation,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...ticketData,
    };

    const docRef = await addDoc(ticketsRef, newTicket);
    return docRef.id;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

// Fetch user's tickets
export const fetchUserTickets = async (userId) => {
  try {
    const userProfile = await fetchUserProfile(userId);

    if (
      !userProfile.municipalCouncil ||
      !userProfile.district ||
      !userProfile.ward
    ) {
      throw new Error("Location not set");
    }

    const ticketsRef = collection(
      firestore,
      `municipalCouncils/${userProfile.municipalCouncil}/Districts/${userProfile.district}/Wards/${userProfile.ward}/tickets`
    );

    const q = query(
      ticketsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw error;
  }
};

// Get real-time updates for user's tickets
export const subscribeToUserTickets = (userId, callback) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userProfile = await fetchUserProfile(userId);

      if (
        !userProfile.municipalCouncil ||
        !userProfile.district ||
        !userProfile.ward
      ) {
        throw new Error("Location not set");
      }

      const ticketsRef = collection(
        firestore,
        `municipalCouncils/${userProfile.municipalCouncil}/Districts/${userProfile.district}/Wards/${userProfile.ward}/tickets`
      );

      const q = query(
        ticketsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const tickets = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            resolvedAt: doc.data().resolvedAt?.toDate(),
          }));
          callback(tickets);
        },
        (error) => {
          console.error("Error in tickets subscription:", error);
          reject(error);
        }
      );

      resolve(unsubscribe);
    } catch (error) {
      console.error("Error setting up tickets subscription:", error);
      reject(error);
    }
  });
};

// Get today's scheduled waste types for the user
export const getTodayScheduledWasteTypes = async (userId) => {
  try {
    const schedules = await fetchUserSchedules(userId);
    const today = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayName = days[today.getDay()];

    const todaySchedules = schedules.filter(
      (schedule) => schedule.day === todayName || schedule.day === "All"
    );

    return todaySchedules.map((schedule) => schedule.wasteType);
  } catch (error) {
    console.error("Error fetching today's scheduled waste types:", error);
    throw error;
  }
};
