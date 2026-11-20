import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getCurrentSession } from "@/lib/auth";
import { getActiveOrganizationId, getCurrentUserOrganizations, setActiveOrganizationId } from "@/lib/organizations";

export default function IndexScreen() {
  const [status, setStatus] = useState<"loading" | "signedOut" | "needsOrganization" | "ready">("loading");

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const session = await getCurrentSession();

        if (!session) {
          if (!cancelled) setStatus("signedOut");
          return;
        }

        const organizations = await getCurrentUserOrganizations();

        if (!organizations.length) {
          if (!cancelled) setStatus("needsOrganization");
          return;
        }

        const activeOrganizationId = await getActiveOrganizationId();
        const activeOrganization = organizations.find((org) => org.id === activeOrganizationId) ?? organizations[0];

        await setActiveOrganizationId(activeOrganization.id);

        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("signedOut");
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === "signedOut") {
    return <Redirect href="/auth/sign-in" />;
  }

  if (status === "needsOrganization") {
    return <Redirect href="/onboarding/create-organization" />;
  }

  return <Redirect href="/(app)/dashboard" />;
}
