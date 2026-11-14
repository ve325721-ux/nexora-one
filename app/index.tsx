import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.page}>
      <View style={styles.brandRow}>
        <View style={styles.mark}><Text style={styles.markText}>N</Text></View>
        <Text style={styles.brand}>NEXORA <Text style={styles.brandLight}>ONE</Text></Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>BUSINESS, CONNECTED</Text>
        <Text style={styles.heading}>Run your work.{"\n"}Not your tools.</Text>
        <Text style={styles.description}>A clearer way to manage customers, projects, tasks and payments.</Text>
        <View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>Foundation workspace initialized</Text></View>
        <Text style={styles.note}>Nexora One is under development. Your business workspace will take shape here.</Text>
      </View>
      <Text style={styles.footer}>NEXORA TECHNOLOGIES  ·  0.1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, minHeight: "100%", backgroundColor: "#F7F8FA", paddingHorizontal: 28, paddingVertical: 30, justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#17243A", alignItems: "center", justifyContent: "center" },
  markText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  brand: { color: "#17243A", fontSize: 14, fontWeight: "800", letterSpacing: 1.5 },
  brandLight: { color: "#718096", fontWeight: "500" },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", paddingVertical: 56 },
  eyebrow: { color: "#64748B", fontSize: 11, fontWeight: "700", letterSpacing: 2.2, marginBottom: 18 },
  heading: { color: "#17243A", fontSize: 48, lineHeight: 55, fontWeight: "700", letterSpacing: -1.8 },
  description: { color: "#64748B", fontSize: 17, lineHeight: 27, marginTop: 18, maxWidth: 440 },
  status: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 34, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7EBF0", borderRadius: 12, alignSelf: "flex-start" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D69E36" },
  statusText: { color: "#334155", fontSize: 13, fontWeight: "600" },
  note: { color: "#94A3B8", fontSize: 12, lineHeight: 19, marginTop: 18, maxWidth: 390 },
  footer: { color: "#94A3B8", fontSize: 10, fontWeight: "700", letterSpacing: 1.5 }
});
