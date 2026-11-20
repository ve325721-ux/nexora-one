import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { signOut } from "@/lib/auth";
import { getActiveOrganizationId, getCurrentUserOrganizations, setActiveOrganizationId, type OrganizationSummary } from "@/lib/organizations";

export default function DashboardScreen() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [activeOrganizationId, setActiveOrganization] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function refresh() {
        try {
          const activeId = await getActiveOrganizationId();
          const nextOrganizations = await getCurrentUserOrganizations();
          if (active) {
            setOrganizations(nextOrganizations);
            setActiveOrganization(activeId ?? nextOrganizations[0]?.id ?? null);
          }
        } catch {
          router.replace("/auth/sign-in");
        }
      }

      refresh();
      return () => {
        active = false;
      };
    }, [router])
  );

  async function handleSignOut() {
    await signOut();
    router.replace("/auth/sign-in");
  }

  async function handleWorkspaceChange(organizationId: string) {
    await setActiveOrganizationId(organizationId);
    setActiveOrganization(organizationId);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>Workspace overview</Text>
          <Text style={styles.title}>Nexora One</Text>
        </View>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Active workspace</Text>
        {organizations.length ? (
          organizations.map((organization) => (
            <Pressable
              key={organization.id}
              style={[styles.workspaceRow, activeOrganizationId === organization.id && styles.workspaceRowActive]}
              onPress={() => handleWorkspaceChange(organization.id)}
            >
              <View>
                <Text style={styles.workspaceName}>{organization.name}</Text>
                <Text style={styles.workspaceMeta}>{organization.role.toUpperCase()} · {organization.currency}</Text>
              </View>
              <Text style={styles.workspaceBadge}>{activeOrganizationId === organization.id ? "Selected" : "Switch"}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyText}>No organizations yet. Create your first business to continue.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Next steps</Text>
        <Text style={styles.listItem}>• Create a customer record</Text>
        <Text style={styles.listItem}>• Add a project and assign tasks</Text>
        <Text style={styles.listItem}>• Issue an invoice and record a payment</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  content: { padding: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  kicker: { color: "#53627A", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { fontSize: 30, fontWeight: "700", color: "#111827" },
  signOutButton: { backgroundColor: "#111827", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  signOutText: { color: "#fff", fontWeight: "600" },
  sectionCard: { backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 18, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  workspaceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#E6EAF2", borderRadius: 12, padding: 14, marginBottom: 10 },
  workspaceRowActive: { borderColor: "#111827", backgroundColor: "#F3F4F6" },
  workspaceName: { fontSize: 16, fontWeight: "600" },
  workspaceMeta: { fontSize: 12, color: "#53627A", marginTop: 4 },
  workspaceBadge: { fontSize: 12, fontWeight: "700", color: "#111827" },
  emptyText: { color: "#53627A" },
  listItem: { color: "#111827", fontSize: 15, marginBottom: 8 },
});
