import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";

const ink = "#152238";
const muted = "#64748B";
const red = "#A7193B";

export default function LandingPage() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.nav}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>N</Text></View>
        <Text style={styles.brand}>NEXORA <Text style={styles.brandLight}>ONE</Text></Text>
        <Link href="/" asChild><Pressable><Text style={styles.signIn}>Workspace preview ↗</Text></Pressable></Link>
      </View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>THE BUSINESS WORKSPACE</Text>
        <Text style={styles.title}>Run your business.{ "\n" }Not your busywork.</Text>
        <Text style={styles.description}>Bring customers, projects, tasks and payments into one connected workspace. Know what needs attention and keep every job moving.</Text>
        <View style={styles.actions}>
          <Link href="/" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Explore the workspace ↗</Text></Pressable></Link>
        </View>
        <View style={styles.visual}><Text style={styles.visualEyebrow}>ONE CONNECTED WORKFLOW</Text><Text style={styles.visualTitle}>Inquiry  →  Project  →  Payment</Text><Text style={styles.visualText}>A clearer view of every customer relationship and every moving part.</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={styles.eyebrow}>BUILT AROUND YOUR WORK</Text>
        <Text style={styles.sectionTitle}>Everything connected. Nothing scattered.</Text>
        <View style={styles.grid}>
          {["Customers","Projects","Tasks","Invoices","Payments","Team access"].map((item, i) => (
            <View key={item} style={styles.card}><Text style={styles.number}>0{i+1}</Text><Text style={styles.cardTitle}>{item}</Text><Text style={styles.cardText}>Keep the details, decisions and next steps in one organised place.</Text></View>
          ))}
        </View>
      </View>
      <View style={styles.footer}><Text style={styles.brand}>NEXORA ONE</Text><Text style={styles.footerText}>A connected workspace for growing service businesses.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:"#F7F8FA"},content:{paddingBottom:40},
  nav:{minHeight:72,paddingHorizontal:22,flexDirection:"row",alignItems:"center",gap:10,borderBottomWidth:1,borderBottomColor:"#E7EBF0",backgroundColor:"#FFFFFF"},
  brandMark:{width:34,height:34,borderRadius:10,backgroundColor:red,alignItems:"center",justifyContent:"center"},
  brandMarkText:{color:"#FFFFFF",fontSize:20,fontWeight:"900"},brand:{color:ink,fontSize:13,fontWeight:"900",letterSpacing:1.2},
  brandLight:{color:"#7B8797",fontWeight:"500"},signIn:{marginLeft:"auto",color:ink,fontSize:12,fontWeight:"700"},
  hero:{paddingHorizontal:24,paddingTop:76,paddingBottom:54,backgroundColor:"#F1F3F6"},
  eyebrow:{color:red,fontSize:10,fontWeight:"800",letterSpacing:2},title:{color:ink,fontSize:42,lineHeight:48,fontWeight:"900",letterSpacing:-1.8,marginTop:18},
  description:{color:muted,fontSize:15,lineHeight:25,marginTop:18,maxWidth:560},actions:{marginTop:26,flexDirection:"row"},
  primary:{backgroundColor:red,borderRadius:10,paddingHorizontal:18,paddingVertical:14},primaryText:{color:"#FFFFFF",fontSize:13,fontWeight:"800"},
  visual:{marginTop:44,padding:22,borderRadius:18,backgroundColor:"#17243A",minHeight:180,justifyContent:"center"},
  visualEyebrow:{color:"#8FB6D7",fontSize:9,fontWeight:"800",letterSpacing:2},visualTitle:{color:"#FFFFFF",fontSize:22,fontWeight:"800",marginTop:14},
  visualText:{color:"#B8C4D3",fontSize:12,lineHeight:20,marginTop:9},
  section:{paddingHorizontal:22,paddingTop:58},sectionTitle:{color:ink,fontSize:28,lineHeight:34,fontWeight:"800",letterSpacing:-.7,marginTop:13,marginBottom:22},
  grid:{gap:12},card:{backgroundColor:"#FFFFFF",borderWidth:1,borderColor:"#E6EAF0",borderRadius:14,padding:18},
  number:{color:red,fontSize:10,fontWeight:"900",letterSpacing:1},cardTitle:{color:ink,fontSize:17,fontWeight:"800",marginTop:12},
  cardText:{color:muted,fontSize:12,lineHeight:20,marginTop:7},footer:{marginTop:56,padding:24,borderTopWidth:1,borderTopColor:"#E6EAF0"},
  footerText:{color:muted,fontSize:11,marginTop:8}
});
