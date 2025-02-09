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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CustomText from "../utils/CustomText";
import { COLORS } from "../utils/Constants";

const { width } = Dimensions.get("window");
const CACHE_KEY = "cached_news";
const CACHE_DURATION = 5 * 60 * 1000;
const AUTO_SCROLL_INTERVAL = 5000;
const FETCH_INTERVAL = 300000;
const API_URL =
  "https://nodejs-serverless-function-express-steel-seven.vercel.app/api/hello";

const NewsItem = React.memo(({ item, onPress, currentIndex, totalDots }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.slide, { width: width - 30 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {!imageLoaded && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.image}
          onLoad={() => setImageLoaded(true)}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <CustomText numberOfLines={2} style={styles.title}>
            {item.title}
          </CustomText>
        </View>
        <View style={styles.paginationWrapper}>
          <View style={styles.pagination}>
            {totalDots.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: currentIndex === index ? 16 : 8,
                    opacity: currentIndex === index ? 1 : 0.5,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      setError("Failed to fetch latest news");

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
          x: nextIndex * (width - 30),
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
        event.nativeEvent.contentOffset.x / (width - 30)
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
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && news.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <CustomText style={styles.errorText}>{error}</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginHorizontal: 15,
  },
  centerContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    alignItems: "center",
  },
  slide: {
    height: "100%",
  },
  imageContainer: {
    width: "100%",
    height: "70%",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: COLORS.secondary,
  },
  imagePlaceholder: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  textContainer: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -15,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    lineHeight: 22,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
  },
  paginationWrapper: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingBottom: 15,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});
