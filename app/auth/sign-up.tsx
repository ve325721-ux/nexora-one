import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { signUpWithEmail } from "@/lib/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Full name, email and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail({ email: email.trim(), password, fullName: fullName.trim() });
      setSuccess("Account created. Check your email to confirm it before signing in.");
      setTimeout(() => router.replace("/auth/sign-in"), 1200);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start your Nexora workspace.</Text>

        <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} style={styles.input} />
        <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create account</Text>}
        </Pressable>

        <Link href="/auth/sign-in" asChild>
          <Pressable>
            <Text style={styles.linkText}>Already have an account? Sign in</Text>
          </Pressable>
        </Link>
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
  linkText: { textAlign: "center", marginTop: 16, color: "#0f172a", fontWeight: "600" },
});
