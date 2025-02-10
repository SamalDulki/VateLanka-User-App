import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CustomText from "../utils/CustomText";
import { COLORS } from "../utils/Constants";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CACHE_KEY = "cached_news";
const CACHE_DURATION = 5 * 60 * 1000;
const AUTO_SCROLL_INTERVAL = 5000;
const FETCH_INTERVAL = 300000;
const API_URL =
  "https://nodejs-serverless-function-express-steel-seven.vercel.app/api/hello";

const NewsItemSkeleton = () => (
  <View style={[styles.slide, { width: CARD_WIDTH }]}>
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonText} />
      </View>
    </View>
  </View>
);

const NewsItem = React.memo(({ item, onPress, currentIndex, totalDots }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (imageLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [imageLoaded]);

  return (
    <Pressable
      style={[styles.slide, { width: CARD_WIDTH }]}
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.1)" }}
    >
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {!imageLoaded && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.image}
              onLoad={() => setImageLoaded(true)}
            />
            <View style={styles.overlay} />
          </Animated.View>

          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Icon name="fiber-new" size={16} color={COLORS.white} />
              <CustomText style={styles.badgeText}>Latest Update</CustomText>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <CustomText numberOfLines={2} style={styles.title}>
              {item.title}
            </CustomText>
          </View>

          <View style={styles.footer}>
            <View style={styles.pagination}>
              {totalDots.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: currentIndex === index ? 20 : 8,
                      backgroundColor:
                        currentIndex === index
                          ? COLORS.primary
                          : COLORS.borderGray,
                    },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <CustomText style={styles.readMoreText}>Read More</CustomText>
              <Icon name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

export const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const timerRef = useRef(null);

  const fetchAndStoreNews = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(API_URL);
      const newsItems = response.data.slice(0, 10);

      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          items: newsItems,
          timestamp: Date.now(),
        })
      );

      setNews(newsItems);
    } catch (error) {
      console.error("News fetch error:", error);
      setError("Unable to load updates");

      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { items, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setNews(items);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialNews = async () => {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { items, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setNews(items);
          setIsLoading(false);
        }
      }
      fetchAndStoreNews();
    };

    loadInitialNews();
    const interval = setInterval(fetchAndStoreNews, FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAndStoreNews]);

  useEffect(() => {
    if (news.length === 0) return;

    const startAutoScroll = () => {
      timerRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % news.length;
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * CARD_WIDTH,
          animated: true,
        });
      }, AUTO_SCROLL_INTERVAL);
    };

    startAutoScroll();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, news.length]);

  const handleScroll = useCallback(
    (event) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / CARD_WIDTH
      );
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    },
    [currentIndex]
  );

  const handleReadMore = useCallback((url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.warn("Cannot open URL:", err)
      );
    }
  }, []);

  if (isLoading) {
    return <NewsItemSkeleton />;
  }

  if (error && news.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={40} color={COLORS.errorbanner} />
        <CustomText style={styles.errorText}>{error}</CustomText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAndStoreNews}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={20} color={COLORS.white} />
          <CustomText style={styles.retryText}>Try Again</CustomText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScroll}
      scrollEventThrottle={16}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH}
      contentContainerStyle={styles.scrollContent}
    >
      {news.map((item, index) => (
        <NewsItem
          key={index}
          item={item}
          currentIndex={currentIndex}
          totalDots={news}
          onPress={() => handleReadMore(item.readMoreLink)}
        />
      ))}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  slide: {
    height: 380,
    paddingHorizontal: 20,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageWrapper: {
    height: 220,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.secondary,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
  },
  imageContainer: {
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  badgeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  readMoreText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  skeletonCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  skeletonImage: {
    height: 220,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonText: {
    height: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    width: "60%",
  },
  errorContainer: {
    height: 380,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    margin: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  errorText: {
    color: COLORS.textGray,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  scrollContent: {
    paddingVertical: 10,
  },
});
