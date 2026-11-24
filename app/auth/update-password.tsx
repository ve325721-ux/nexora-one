import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { updatePassword } from "@/lib/auth";

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");
    if (password.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (password !== confirmPassword) { setError("The passwords do not match."); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess("Password updated. Returning to Nexora One...");
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Choose a new password</Text>
        <Text style={styles.subtitle}>Use at least eight characters.</Text>
        <TextInput placeholder="New password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
        <TextInput placeholder="Confirm new password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Update password</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: "#f5f7fb" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 24, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 12, elevation: 2 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#53627A", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#d7dde9", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, fontSize: 16 },
  error: { color: "#b42318", fontSize: 13, marginBottom: 12 },
  success: { color: "#157347", fontSize: 13, marginBottom: 12 },
  primaryButton: { backgroundColor: "#111827", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  disabled: { opacity: 0.7 },
});
