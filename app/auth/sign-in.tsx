import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getSupabaseClient } from "@/lib/supabase";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error("Supabase environment variables are missing.");
      }

      const { error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });

      if (authError) {
        throw new Error(authError.message);
      }

      router.replace("/");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Manage your business, projects and team.</Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
        </Pressable>

        <Link href="/auth/sign-up" asChild>
          <Pressable>
            <Text style={styles.linkText}>Need an account? Sign up</Text>
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
  primaryButton: { backgroundColor: "#111827", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  disabled: { opacity: 0.7 },
  linkText: { textAlign: "center", marginTop: 16, color: "#0f172a", fontWeight: "600" },
});
