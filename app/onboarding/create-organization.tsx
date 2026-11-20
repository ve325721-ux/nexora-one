import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createOrganization, slugify } from "@/lib/organizations";

export default function CreateOrganizationScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("US");
  const [timeZone, setTimeZone] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateSlugFromName(value: string) {
    setName(value);
    if (!slug.trim()) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit() {
    setError("");

    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Business slug is required.");
      return;
    }

    setLoading(true);

    try {
      await createOrganization({
        name: name.trim(),
        slug: slug.trim(),
        currency: currency.trim().toUpperCase() || "USD",
        country: country.trim().toUpperCase() || "US",
        timeZone: timeZone.trim() || "UTC",
        businessEmail: email.trim() || undefined,
      });

      router.replace("/");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create the organization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create your first business</Text>
        <Text style={styles.subtitle}>Set up your organization and start managing customer work.</Text>

        <TextInput placeholder="Business name" value={name} onChangeText={updateSlugFromName} style={styles.input} />
        <TextInput placeholder="Business slug" value={slug} onChangeText={setSlug} style={styles.input} />
        <TextInput placeholder="Currency (USD)" value={currency} onChangeText={setCurrency} autoCapitalize="characters" style={styles.input} />
        <TextInput placeholder="Country (US)" value={country} onChangeText={setCountry} autoCapitalize="characters" style={styles.input} />
        <TextInput placeholder="Time zone (UTC)" value={timeZone} onChangeText={setTimeZone} style={styles.input} />
        <TextInput placeholder="Business email (optional)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create organization</Text>}
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
  primaryButton: { backgroundColor: "#111827", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  disabled: { opacity: 0.7 },
});
