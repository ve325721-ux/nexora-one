import { useCallback, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import NexoraLaunchAnimation from "../NexoraLaunchAnimation";

export default function RootLayout() {
  const [launchVisible, setLaunchVisible] = useState(true);
  const finishLaunch = useCallback(() => setLaunchVisible(false), []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={launchVisible ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F7F8FA" } }} />
      {launchVisible ? <NexoraLaunchAnimation onFinish={finishLaunch} /> : null}
    </View>
  );
}
