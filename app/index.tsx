import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const palette = {
  ink: "#17243A",
  muted: "#718096",
  faint: "#9AA5B5",
  line: "#E8ECF2",
  canvas: "#F5F7FA",
  white: "#FFFFFF",
  red: "#A7193B",
  redSoft: "#FBECEF",
  green: "#23815D",
  greenSoft: "#E9F5EF",
  amber: "#A66A19",
  amberSoft: "#FFF4E3",
  blue: "#3768A6",
  blueSoft: "#ECF3FC",
};

const navigation = [
  { icon: "⌂", label: "Overview", active: true },
  { icon: "◎", label: "Customers" },
  { icon: "▦", label: "Projects" },
  { icon: "☷", label: "Tasks" },
  { icon: "▤", label: "Invoices" },
  { icon: "↗", label: "Payments" },
];

const activities = [
  { initials: "AM", name: "Amina Musa", action: "was added as a customer", time: "12 minutes ago", color: "#E8EEF9" },
  { initials: "JD", name: "James Digital", action: "received a new project", time: "1 hour ago", color: "#F7EAF0" },
  { initials: "KO", name: "Kola Okafor", action: "completed a project task", time: "Yesterday", color: "#E9F4EF" },
];

const projects = [
  { name: "Website redesign", customer: "James Digital", progress: 72, status: "In progress", color: palette.red },
  { name: "Mobile app interface", customer: "Amina Musa", progress: 45, status: "In progress", color: palette.blue },
  { name: "Brand identity system", customer: "Northstar Studio", progress: 100, status: "Completed", color: palette.green },
];

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

function MetricCard({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: string; tone: "red" | "blue" | "green" | "amber" }) {
  const tint = tone === "red" ? palette.redSoft : tone === "blue" ? palette.blueSoft : tone === "green" ? palette.greenSoft : palette.amberSoft;
  const color = tone === "red" ? palette.red : tone === "blue" ? palette.blue : tone === "green" ? palette.green : palette.amber;
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={[styles.metricIcon, { backgroundColor: tint }]}><Text style={{ color, fontSize: 17, fontWeight: "700" }}>{icon}</Text></View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricNote}>{note}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const narrow = width < 430;

  return (
    <View style={styles.app}>
      {!compact ? (
        <View style={styles.sidebar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>N</Text></View>
            <View><Text style={styles.brandName}>NEXORA <Text style={styles.brandLight}>ONE</Text></Text><Text style={styles.brandCaption}>BUSINESS WORKSPACE</Text></View>
          </View>
          <Text style={styles.navCaption}>WORKSPACE</Text>
          {navigation.map((item) => (
            <View key={item.label} style={[styles.navItem, item.active && styles.navItemActive]}>
              <Text style={[styles.navIcon, item.active && styles.navTextActive]}>{item.icon}</Text>
              <Text style={[styles.navText, item.active && styles.navTextActive]}>{item.label}</Text>
            </View>
          ))}
          <View style={styles.sidebarBottom}>
            <View style={styles.helpBox}><Text style={styles.helpTitle}>A clearer way to work.</Text><Text style={styles.helpText}>Keep your customers, projects and payments connected.</Text></View>
            <View style={styles.profileRow}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>VO</Text></View><View style={{ flex: 1 }}><Text style={styles.profileName}>Victor Okafor</Text><Text style={styles.profileRole}>Workspace owner · Preview</Text></View><Text style={styles.profileMore}>•••</Text></View>
          </View>
        </View>
      ) : null}

      <View style={styles.main}>
        <View style={styles.topbar}>
          {compact ? (
            <View style={styles.brandRow}>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>N</Text></View>
              <Text style={styles.brandName}>NEXORA <Text style={styles.brandLight}>ONE</Text></Text>
            </View>
          ) : <Text style={styles.breadcrumb}>Workspace <Text style={styles.breadcrumbSlash}>/</Text> Overview</Text>}
          <View style={styles.topbarRight}>
            <View style={styles.previewBadge}><View style={styles.previewDot} /><Text style={styles.previewText}>DEMO PREVIEW</Text></View>
            <View style={styles.topAvatar}><Text style={styles.topAvatarText}>VO</Text></View>
          </View>
        </View>

        {compact ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNav}>
            {navigation.map((item) => <View key={item.label} style={[styles.mobileNavItem, item.active && styles.mobileNavActive]}><Text style={[styles.mobileNavText, item.active && styles.navTextActive]}>{item.label}</Text></View>)}
          </ScrollView>
        ) : null}

        <ScrollView style={styles.contentScroll} contentContainerStyle={[styles.content, { paddingHorizontal: narrow ? 16 : compact ? 22 : 34 }]}>
          <View style={styles.welcomeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>MONDAY, 16 NOVEMBER 2026</Text>
              <Text style={[styles.pageTitle, narrow && { fontSize: 25 }]}>Good morning, Victor</Text>
              <Text style={styles.pageSubtitle}>Here’s what’s happening across your business today.</Text>
            </View>
            <View style={styles.workspacePill}><View style={styles.workspaceDot} /><Text style={styles.workspacePillText}>Nexora Studio</Text><Text style={styles.chevron}>⌄</Text></View>
          </View>

          <View style={styles.previewNotice}><Text style={styles.noticeIcon}>ⓘ</Text><Text style={styles.noticeText}>This is a product preview with sample information. Connect an organization and database before using real business data.</Text></View>

          <View style={[styles.metricsGrid, compact && styles.metricsGridCompact]}>
            <MetricCard label="Total customers" value="48" note="Across all customer records" icon="◎" tone="blue" />
            <MetricCard label="Active projects" value="12" note="3 need attention" icon="▦" tone="red" />
            <MetricCard label="Outstanding invoices" value="$8,450" note="Across 7 unpaid invoices" icon="▤" tone="amber" />
            <MetricCard label="Payments received" value="$12,680" note="Recorded this month" icon="↗" tone="green" />
          </View>

          <View style={[styles.middleGrid, compact && styles.middleGridCompact]}>
            <View style={styles.panel}>
              <View style={styles.panelHeader}><SectionTitle title="Project progress" detail="A snapshot of current delivery" /><Text style={styles.textLink}>View projects ↗</Text></View>
              {projects.map((project, index) => (
                <View key={project.name} style={[styles.projectRow, index === projects.length - 1 && { borderBottomWidth: 0, paddingBottom: 2 }]}>
                  <View style={styles.projectMeta}><View style={{ flex: 1 }}><Text style={styles.projectName}>{project.name}</Text><Text style={styles.projectCustomer}>{project.customer}</Text></View><Text style={[styles.projectStatus, project.status === "Completed" && { color: palette.green }]}>{project.status}</Text></View>
                  <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: project.color }]} /></View>
                  <Text style={styles.progressLabel}>{project.progress}% complete</Text>
                </View>
              ))}
            </View>
            <View style={styles.panel}>
              <View style={styles.panelHeader}><SectionTitle title="Invoice overview" detail="Outstanding balance" /></View>
              <Text style={styles.invoiceTotal}>$8,450.00</Text>
              <Text style={styles.invoiceCaption}>Total awaiting payment</Text>
              <View style={styles.invoiceBar}><View style={styles.invoicePaid} /><View style={styles.invoicePending} /><View style={styles.invoiceLate} /></View>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: palette.green }]} /><Text style={styles.legendLabel}>Paid</Text><Text style={styles.legendValue}>$12,680</Text></View>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: "#D9A441" }]} /><Text style={styles.legendLabel}>Pending</Text><Text style={styles.legendValue}>$6,200</Text></View>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: palette.red }]} /><Text style={styles.legendLabel}>Overdue</Text><Text style={styles.legendValue}>$2,250</Text></View>
              <Text style={styles.smallFootnote}>Illustrative figures for layout preview only.</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}><SectionTitle title="Recent activity" detail="The latest updates from your workspace" /><Text style={styles.textLink}>View activity ↗</Text></View>
            {activities.map((activity, index) => (
              <View key={activity.name} style={[styles.activityRow, index === activities.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.activityAvatar, { backgroundColor: activity.color }]}><Text style={styles.activityInitials}>{activity.initials}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.activityDescription}><Text style={styles.activityName}>{activity.name}</Text> {activity.action}</Text><Text style={styles.activityTime}>{activity.time}</Text></View>
                <Text style={styles.activityArrow}>↗</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}><Text style={styles.footerBrand}>NEXORA ONE</Text><Text style={styles.footerText}>A connected workspace for growing service businesses.</Text><Text style={styles.footerVersion}>Prototype interface · Sample data · v0.1.0</Text></View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, minHeight: "100%", flexDirection: "row", backgroundColor: palette.canvas },
  sidebar: { width: 246, backgroundColor: palette.white, borderRightWidth: 1, borderRightColor: palette.line, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 18 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 36, height: 36, borderRadius: 11, backgroundColor: palette.red, alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: palette.white, fontSize: 21, fontWeight: "800" },
  brandName: { color: palette.ink, fontSize: 13, fontWeight: "800", letterSpacing: 1.25 },
  brandLight: { color: palette.muted, fontWeight: "500" },
  brandCaption: { color: palette.faint, fontSize: 8, fontWeight: "700", letterSpacing: 1.5, marginTop: 3 },
  navCaption: { color: palette.faint, fontSize: 9, fontWeight: "800", letterSpacing: 1.7, marginTop: 46, marginBottom: 13, marginLeft: 9 },
  navItem: { height: 43, borderRadius: 9, flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 12, marginBottom: 5 },
  navItemActive: { backgroundColor: palette.redSoft },
  navIcon: { color: palette.muted, width: 18, fontSize: 18, textAlign: "center" },
  navText: { color: "#59677A", fontSize: 13, fontWeight: "600" },
  navTextActive: { color: palette.red, fontWeight: "800" },
  sidebarBottom: { marginTop: "auto" },
  helpBox: { backgroundColor: "#F8F4F5", borderRadius: 12, padding: 14, marginBottom: 18 },
  helpTitle: { color: palette.ink, fontSize: 12, fontWeight: "800", marginBottom: 6 },
  helpText: { color: palette.muted, fontSize: 10, lineHeight: 16 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 9, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 16 },
  profileAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F0E3E7", alignItems: "center", justifyContent: "center" },
  profileAvatarText: { color: palette.red, fontSize: 10, fontWeight: "800" },
  profileName: { color: palette.ink, fontSize: 11, fontWeight: "700" },
  profileRole: { color: palette.faint, fontSize: 9, marginTop: 3 },
  profileMore: { color: palette.muted, fontSize: 15 },
  main: { flex: 1, minWidth: 0 },
  topbar: { height: 66, backgroundColor: palette.white, borderBottomWidth: 1, borderBottomColor: palette.line, paddingHorizontal: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  breadcrumb: { color: palette.muted, fontSize: 12, fontWeight: "600" },
  breadcrumbSlash: { color: palette.faint },
  topbarRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  previewBadge: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: palette.amberSoft },
  previewDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.amber },
  previewText: { color: palette.amber, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  topAvatar: { width: 31, height: 31, borderRadius: 16, backgroundColor: "#F0E3E7", alignItems: "center", justifyContent: "center" },
  topAvatarText: { color: palette.red, fontSize: 10, fontWeight: "800" },
  mobileNav: { backgroundColor: palette.white, paddingHorizontal: 15, paddingVertical: 9, gap: 7, borderBottomWidth: 1, borderBottomColor: palette.line },
  mobileNavItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  mobileNavActive: { backgroundColor: palette.redSoft },
  mobileNavText: { color: palette.muted, fontSize: 11, fontWeight: "700" },
  contentScroll: { flex: 1 },
  content: { paddingTop: 29, paddingBottom: 30, maxWidth: 1440, width: "100%", alignSelf: "center" },
  welcomeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" },
  eyebrow: { color: palette.faint, fontSize: 9, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 },
  pageTitle: { color: palette.ink, fontSize: 28, fontWeight: "800", letterSpacing: -0.8 },
  pageSubtitle: { color: palette.muted, fontSize: 12, marginTop: 7 },
  workspacePill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10 },
  workspaceDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.green },
  workspacePillText: { color: palette.ink, fontSize: 11, fontWeight: "700" },
  chevron: { color: palette.muted, fontSize: 14, marginLeft: 5 },
  previewNotice: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#FFF9ED", borderColor: "#F2E3C5", borderWidth: 1, padding: 11, borderRadius: 9, marginBottom: 17 },
  noticeIcon: { color: palette.amber, fontSize: 14, fontWeight: "800" },
  noticeText: { flex: 1, color: "#86602B", fontSize: 10, lineHeight: 15 },
  metricsGrid: { flexDirection: "row", gap: 13, marginBottom: 16 },
  metricsGridCompact: { flexWrap: "wrap" },
  metricCard: { flex: 1, minWidth: 145, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 12, padding: 15 },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metricLabel: { color: palette.muted, fontSize: 10, fontWeight: "600" },
  metricIcon: { width: 29, height: 29, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  metricValue: { color: palette.ink, fontSize: 24, fontWeight: "800", letterSpacing: -0.6, marginTop: 14 },
  metricNote: { color: palette.faint, fontSize: 9, marginTop: 5 },
  middleGrid: { flexDirection: "row", gap: 15, marginBottom: 16 },
  middleGridCompact: { flexDirection: "column" },
  panel: { flex: 1, minWidth: 0, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 12, padding: 17, marginBottom: 0 },
  panelHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 17 },
  sectionHeading: { flex: 1 },
  sectionTitle: { color: palette.ink, fontSize: 13, fontWeight: "800" },
  sectionDetail: { color: palette.faint, fontSize: 9, marginTop: 5 },
  textLink: { color: palette.red, fontSize: 9, fontWeight: "700" },
  projectRow: { borderBottomWidth: 1, borderBottomColor: "#F0F2F5", paddingBottom: 13, marginBottom: 13 },
  projectMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  projectName: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  projectCustomer: { color: palette.faint, fontSize: 9, marginTop: 4 },
  projectStatus: { color: palette.blue, fontSize: 8, fontWeight: "700" },
  progressTrack: { height: 5, borderRadius: 5, backgroundColor: "#EEF1F5", overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 5 },
  progressLabel: { color: palette.faint, fontSize: 8, marginTop: 6, textAlign: "right" },
  invoiceTotal: { color: palette.ink, fontSize: 27, fontWeight: "800", letterSpacing: -0.8 },
  invoiceCaption: { color: palette.faint, fontSize: 9, marginTop: 4 },
  invoiceBar: { height: 8, flexDirection: "row", borderRadius: 6, overflow: "hidden", marginTop: 19, marginBottom: 17, backgroundColor: "#EEF1F5" },
  invoicePaid: { flex: 6, backgroundColor: palette.green },
  invoicePending: { flex: 3, backgroundColor: "#D9A441" },
  invoiceLate: { flex: 1, backgroundColor: palette.red },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 11, gap: 8 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { color: palette.muted, fontSize: 9, flex: 1 },
  legendValue: { color: palette.ink, fontSize: 9, fontWeight: "700" },
  smallFootnote: { color: palette.faint, fontSize: 8, marginTop: 5 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F0F2F5" },
  activityAvatar: { width: 31, height: 31, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  activityInitials: { color: palette.ink, fontSize: 9, fontWeight: "800" },
  activityDescription: { color: palette.muted, fontSize: 10 },
  activityName: { color: palette.ink, fontWeight: "800" },
  activityTime: { color: palette.faint, fontSize: 8, marginTop: 4 },
  activityArrow: { color: palette.faint, fontSize: 13 },
  footer: { alignItems: "center", paddingVertical: 25 },
  footerBrand: { color: palette.ink, fontSize: 9, fontWeight: "800", letterSpacing: 1.8 },
  footerText: { color: palette.faint, fontSize: 9, marginTop: 5 },
  footerVersion: { color: palette.faint, fontSize: 8, marginTop: 7 },
});
