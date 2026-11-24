import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getSupabaseClient } from "@/lib/supabase";

type OtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string; token_hash?: string; type?: string; error_description?: string }>();
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    let cancelled = false;
    async function completeAuth() {
      try {
        if (params.error_description) throw new Error(params.error_description.replace(/\+/g, " "));
        const supabase = getSupabaseClient();

        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) throw error;
        } else if (params.token_hash && params.type) {
          const allowed: OtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];
          if (!allowed.includes(params.type as OtpType)) throw new Error("This verification link is not supported.");
          const { error } = await supabase.auth.verifyOtp({
            token_hash: params.token_hash,
            type: params.type as OtpType,
          });
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getUser();
          if (error || !data.user) throw new Error("The verification link is missing or expired.");
        }

        if (!cancelled) {
          setMessage("Verified. Opening Nexora One...");
          router.replace("/");
        }
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to verify this link.");
      }
    }
    completeAuth();
    return () => { cancelled = true; };
  }, [params.code, params.token_hash, params.type, params.error_description, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#701D35" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: "#F7F8FA" },
  message: { marginTop: 18, color: "#111827", fontSize: 15, textAlign: "center" },
});
