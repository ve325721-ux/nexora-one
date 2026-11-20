import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

type NexoraLaunchAnimationProps = {
  onFinish: () => void;
  duration?: number;
};

const DEFAULT_DURATION = 3600;

export default function NexoraLaunchAnimation({
  onFinish,
  duration = DEFAULT_DURATION,
}: NexoraLaunchAnimationProps) {
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.82)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.72)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOffset = useRef(new Animated.Value(10)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineOffset = useRef(new Animated.Value(6)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const orbitRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let finished = false;
    const segment = (fraction: number) => Math.round(duration * fraction);
    const reveal = (value: Animated.Value, toValue: number, time: number) =>
      Animated.timing(value, {
        toValue,
        duration: time,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

    const entrance = Animated.sequence([
      Animated.delay(segment(0.06)),
      Animated.parallel([
        reveal(ringOpacity, 1, segment(0.17)),
        Animated.timing(ringScale, {
          toValue: 1,
          duration: segment(0.17),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(segment(0.04)),
      Animated.parallel([
        reveal(emblemOpacity, 1, segment(0.18)),
        Animated.timing(emblemScale, {
          toValue: 1,
          duration: segment(0.18),
          easing: Easing.out(Easing.back(1.15)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(segment(0.025)),
      Animated.parallel([
        reveal(wordmarkOpacity, 1, segment(0.14)),
        Animated.timing(wordmarkOffset, {
          toValue: 0,
          duration: segment(0.14),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(segment(0.025)),
      Animated.parallel([
        reveal(taglineOpacity, 1, segment(0.12)),
        Animated.timing(taglineOffset, {
          toValue: 0,
          duration: segment(0.12),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(segment(0.13)),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: segment(0.11),
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const orbit = Animated.loop(
      Animated.timing(orbitRotation, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    entrance.start(({ finished: didFinish }) => {
      if (didFinish && !finished) {
        finished = true;
        onFinish();
      }
    });

    orbit.start();

    return () => {
      finished = true;
      entrance.stop();
      orbit.stop();
    };
  }, [
    duration,
    emblemOpacity,
    emblemScale,
    onFinish,
    orbitRotation,
    overlayOpacity,
    ringOpacity,
    ringScale,
    taglineOffset,
    taglineOpacity,
    wordmarkOffset,
    wordmarkOpacity,
  ]);

  const rotation = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.screen, { opacity: overlayOpacity }]}>
      <View style={styles.brand}>
        <View style={styles.emblemStage}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.orbit,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }, { rotate: rotation }],
              },
            ]}
          >
            <View style={styles.orbitDot} />
          </Animated.View>

          <Animated.View
            style={[
              styles.emblem,
              {
                opacity: emblemOpacity,
                transform: [{ scale: emblemScale }],
              },
            ]}
          >
            <Text style={styles.emblemLetter}>N</Text>
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.wordmark,
            {
              opacity: wordmarkOpacity,
              transform: [{ translateY: wordmarkOffset }],
            },
          ]}
        >
          NEXORA <Text style={styles.wordmarkOne}>ONE</Text>
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineOffset }],
            },
          ]}
        >
          ONE PLATFORM. EVERY BUSINESS.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071327",
  },
  brand: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emblemStage: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  orbit: {
    position: "absolute",
    width: 222,
    height: 222,
    borderRadius: 111,
    borderWidth: 1.5,
    borderColor: "rgba(75, 135, 255, 0.9)",
    shadowColor: "#397AFF",
    shadowOpacity: 0.78,
    shadowRadius: 18,
    elevation: 8,
  },
  orbitDot: {
    position: "absolute",
    top: 24,
    left: 32,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    shadowColor: "#70A2FF",
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  emblem: {
    width: 142,
    height: 142,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 38,
    borderWidth: 1,
    borderColor: "rgba(232, 239, 249, 0.24)",
    backgroundColor: "#0D1D35",
    shadowColor: "#4D7FC9",
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 7,
  },
  emblemLetter: {
    color: "#E7ECF4",
    fontSize: 106,
    fontWeight: "700",
    lineHeight: 122,
    letterSpacing: -8,
    textShadowColor: "rgba(255, 255, 255, 0.28)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    includeFontPadding: false,
  },
  wordmark: {
    color: "#F5F7FB",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 4.5,
  },
  wordmarkOne: {
    color: "#8DB2FF",
  },
  tagline: {
    marginTop: 13,
    color: "#AEBBD0",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 3,
    textAlign: "center",
  },
});
