import { useMemo, useRef, type MutableRefObject } from "react";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable, useWindowDimensions } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

const ink = "#152238";
const muted = "#64748B";
const red = "#A7193B";

function Chain({ progress }: { progress: MutableRefObject<number> }) {
  const links = useRef<THREE.Group[]>([]);
  const keyLight = useRef<THREE.PointLight>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.2, -0.2, 0),
    new THREE.Vector3(-3.1, 1.15, 0.25),
    new THREE.Vector3(-0.8, -0.95, -0.15),
    new THREE.Vector3(1.5, 0.85, 0.2),
    new THREE.Vector3(4.9, -0.25, 0)
  ]), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const axis = useMemo(() => new THREE.Vector3(), []);
  const baseQ = useMemo(() => new THREE.Quaternion(), []);
  const twistQ = useMemo(() => new THREE.Quaternion(), []);
  const targetColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const p = Math.max(0, Math.min(1, progress.current));
    const count = links.current.length;
    for (let i = 0; i < count; i++) {
      const object = links.current[i];
      if (!object) continue;
      const t = (i / count + p * 0.34 + state.clock.elapsedTime * 0.012) % 1;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      object.position.copy(point);
      baseQ.setFromUnitVectors(up, tangent);
      axis.copy(tangent);
      twistQ.setFromAxisAngle(axis, i % 2 === 0 ? 0 : Math.PI / 2);
      object.quaternion.copy(baseQ).multiply(twistQ);
    }
    if (keyLight.current) {
      const white = new THREE.Color("#F4F7FC");
      const crimson = new THREE.Color("#A7193B");
      const cyan = new THREE.Color("rgb(80,220,255)");
      if (p < 0.48) targetColor.copy(white).lerp(crimson, p / 0.48);
      else targetColor.copy(crimson).lerp(cyan, (p - 0.48) / 0.52);
      keyLight.current.color.copy(targetColor);
    }
  });

  return (
    <>
      <pointLight ref={keyLight} position={[0, 3, 4]} intensity={110} distance={18} />
      <directionalLight position={[-4, 5, 5]} intensity={2.2} />
      <ambientLight intensity={0.55} />
      {Array.from({ length: 25 }, (_, i) => (
        <group key={i} ref={(node) => { if (node) links.current[i] = node; }}>
          <mesh>
            <torusGeometry args={[0.34, 0.105, 16, 36]} />
            <meshPhysicalMaterial color="#DCE5F0" metalness={1} roughness={0.2} envMapIntensity={2.1} />
          </mesh>
        </group>
      ))}
      <Environment preset="warehouse" />
    </>
  );
}

export default function LandingPage() {
  const scrollRef = useRef<ScrollView>(null);
  const progress = useRef(0);
  const { width, height } = useWindowDimensions();
  const compact = width < 760;
  const onScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    progress.current = Math.max(0, Math.min(1, y / Math.max(height * 2.1, 1)));
  };

  return (
    <ScrollView ref={scrollRef} style={styles.page} contentContainerStyle={styles.pageContent} onScroll={onScroll} scrollEventThrottle={16}>
      <View style={styles.nav}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>N</Text></View>
          <Text style={styles.brand}>NEXORA <Text style={styles.brandLight}>ONE</Text></Text>
        </View>
        {!compact ? <View style={styles.navLinks}><Text style={styles.navLink}>Platform</Text><Text style={styles.navLink}>How it works</Text><Text style={styles.navLink}>For teams</Text></View> : null}
        <View style={styles.navActions}>
          <Link href="/" asChild><Pressable><Text style={styles.signIn}>Workspace preview</Text></Pressable></Link>
          <Link href="/" asChild><Pressable style={styles.navButton}><Text style={styles.navButtonText}>Preview workspace ↗</Text></Pressable></Link>
        </View>
      </View>

      <View style={[styles.hero, { minHeight: Math.max(height - 72, 620) }]}>
        <View style={styles.heroCanvas}>
          <Canvas camera={{ position: [0, 0, 9], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
            <Chain progress={progress} />
          </Canvas>
        </View>
        <View style={[styles.heroCopy, compact && styles.heroCopyCompact]}>
          <Text style={styles.eyebrow}>THE BUSINESS WORKSPACE</Text>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>Run your business.{"\n"}Not your busywork.</Text>
          <Text style={styles.heroDescription}>Customers, projects, tasks and payments — connected in one clear workspace. Know what needs attention. Keep every job moving.</Text>
          <View style={styles.heroActions}>
            <Link href="/" asChild><Pressable style={styles.primaryButton}><Text style={styles.primaryButtonText}>Explore the workspace <Text style={styles.arrow}>↗</Text></Text></Pressable></Link>
            <Pressable style={styles.secondaryButton} onPress={() => scrollRef.current?.scrollTo({ y: height, animated: true })}><Text style={styles.secondaryButtonText}>See how it works ↓</Text></Pressable>
          </View>
          <View style={styles.trustLine}><View style={styles.trustDot} /><Text style={styles.trustText}>One connected workflow. A clearer way to operate.</Text></View>
        </View>
        <View style={styles.heroFoot}><Text style={styles.heroFootLeft}>BUILT FOR SERVICE BUSINESSES</Text><Text style={styles.heroFootRight}>SCROLL TO EXPLORE ↓</Text></View>
      </View>

      <View style={styles.workflow}>
        <Text style={styles.eyebrow}>FROM FIRST CONTACT TO FINAL PAYMENT</Text>
        <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>The whole job, in one view.</Text>
        <Text style={styles.sectionLead}>NEXORA ONE brings the moving parts of your business together, so work doesn't disappear between conversations, spreadsheets and disconnected tools.</Text>
        <View style={[styles.workflowGrid, compact && styles.workflowGridCompact]}>
          {[
            ["01","Capture","Keep customer details and incoming enquiries organised."],
            ["02","Deliver","Turn work into projects, tasks and clear ownership."],
            ["03","Get paid","Create invoices and keep payment status visible."]
          ].map(([n,title,body]) => <View key={n} style={styles.workflowCard}><Text style={styles.workflowNumber}>{n}</Text><Text style={styles.workflowTitle}>{title}</Text><Text style={styles.workflowText}>{body}</Text></View>)}
        </View>
      </View>

      <View style={styles.capabilities}>
        <View style={styles.capabilitiesCopy}>
          <Text style={styles.eyebrow}>A SINGLE SOURCE OF TRUTH</Text>
          <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>Less chasing. More clarity.</Text>
          <Text style={styles.sectionLead}>See the status of customers, projects, tasks, invoices and payments without rebuilding the picture every morning.</Text>
        </View>
        <View style={[styles.capabilityGrid, compact && styles.capabilityGridCompact]}>
          {["Customer records","Project tracking","Task ownership","Invoice management","Payment records","Team permissions"].map((item,i)=><View key={item} style={styles.capability}><Text style={styles.capabilityIndex}>0{i+1}</Text><Text style={styles.capabilityTitle}>{item}</Text><Text style={styles.capabilityArrow}>↗</Text></View>)}
        </View>
      </View>

      <View style={styles.finalCta}>
        <Text style={styles.eyebrow}>MAKE WORK FEEL CONNECTED</Text>
        <Text style={[styles.finalTitle, compact && styles.finalTitleCompact]}>A better view of the business you're building.</Text>
        <Link href="/" asChild><Pressable style={styles.primaryButton}><Text style={styles.primaryButtonText}>Explore NEXORA ONE ↗</Text></Pressable></Link>
      </View>
      <View style={styles.footer}><View><Text style={styles.footerBrand}>NEXORA ONE</Text><Text style={styles.footerText}>A connected workspace for growing service businesses.</Text></View><Text style={styles.footerMeta}>PRODUCT PREVIEW · 2026</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:"#F7F8FA"},pageContent:{paddingBottom:0},
  nav:{height:72,paddingHorizontal: "5%",backgroundColor:"#FFFFFF",borderBottomWidth:1,borderBottomColor:"#E8ECF1",flexDirection:"row",alignItems:"center",justifyContent:"space-between",zIndex:2},
  brandLockup:{flexDirection:"row",alignItems:"center",gap:10},brandMark:{width:34,height:34,borderRadius:10,backgroundColor:red,alignItems:"center",justifyContent:"center"},
  brandMarkText:{color:"#FFFFFF",fontSize:20,fontWeight:"900"},brand:{color:ink,fontSize:13,fontWeight:"900",letterSpacing:1.3},brandLight:{color:"#8490A0",fontWeight:"500"},
  navLinks:{flexDirection:"row",gap:32},navLink:{color:"#526176",fontSize:12,fontWeight:"600"},navActions:{flexDirection:"row",alignItems:"center",gap:22},
  signIn:{color:ink,fontSize:12,fontWeight:"700"},navButton:{backgroundColor:ink,borderRadius:8,paddingHorizontal:15,paddingVertical:11},navButtonText:{color:"#FFFFFF",fontSize:11,fontWeight:"800"},
  hero:{backgroundColor:"#F0F3F7",justifyContent:"center",overflow:"hidden",paddingHorizontal:"8%",paddingTop:70,paddingBottom:82},
  heroCanvas:{position:"absolute",top:0,right:0,bottom:0,width:"64%",opacity:0.92},
  heroCopy:{maxWidth:650,zIndex:1},heroCopyCompact:{maxWidth:"100%"},eyebrow:{color:red,fontSize:10,fontWeight:"900",letterSpacing:2.2},
  heroTitle:{color:ink,fontSize:clampFont(70),lineHeight:1.04,fontWeight:"900",letterSpacing:-3.6,marginTop:20},
  heroTitleCompact:{fontSize:44,lineHeight:49,letterSpacing:-2},heroDescription:{color:muted,fontSize:16,lineHeight:27,maxWidth:510,marginTop:22},
  heroActions:{flexDirection:"row",alignItems:"center",flexWrap:"wrap",gap:18,marginTop:30},primaryButton:{backgroundColor:red,borderRadius:9,paddingHorizontal:20,paddingVertical:15},
  primaryButtonText:{color:"#FFFFFF",fontSize:12,fontWeight:"800"},arrow:{fontSize:14},secondaryButton:{paddingVertical:12},secondaryButtonText:{color:ink,fontSize:12,fontWeight:"800"},
  trustLine:{flexDirection:"row",alignItems:"center",gap:9,marginTop:34},trustDot:{width:7,height:7,borderRadius:4,backgroundColor:"#27835F"},trustText:{color:"#748195",fontSize:10,fontWeight:"600"},
  heroFoot:{position:"absolute",left:"8%",right:"8%",bottom:24,flexDirection:"row",justifyContent:"space-between"},heroFootLeft:{color:"#8A95A4",fontSize:8,fontWeight:"800",letterSpacing:1.6},heroFootRight:{color:"#8A95A4",fontSize:8,fontWeight:"800",letterSpacing:1.6},
  workflow:{paddingHorizontal:"8%",paddingVertical:100,backgroundColor:"#FFFFFF"},sectionTitle:{color:ink,fontSize:48,lineHeight:54,fontWeight:"900",letterSpacing:-2,marginTop:16},
  sectionTitleCompact:{fontSize:34,lineHeight:39,letterSpacing:-1.1},sectionLead:{color:muted,fontSize:14,lineHeight:24,maxWidth:650,marginTop:16},
  workflowGrid:{flexDirection:"row",gap:16,marginTop:52},workflowGridCompact:{flexDirection:"column"},workflowCard:{flex:1,minHeight:190,borderTopWidth:1,borderTopColor:"#DCE2E9",paddingTop:22,paddingRight:20},
  workflowNumber:{color:red,fontSize:10,fontWeight:"900",letterSpacing:1.5},workflowTitle:{color:ink,fontSize:22,fontWeight:"800",marginTop:26},workflowText:{color:muted,fontSize:12,lineHeight:21,marginTop:10,maxWidth:270},
  capabilities:{backgroundColor:"#F0F3F7",paddingHorizontal:"8%",paddingVertical:94},capabilitiesCopy:{maxWidth:660},capabilityGrid:{flexDirection:"row",flexWrap:"wrap",gap:12,marginTop:42},
  capabilityGridCompact:{flexDirection:"column"},capability:{width:"31%",minWidth:210,minHeight:112,backgroundColor:"#FFFFFF",borderWidth:1,borderColor:"#E2E7ED",borderRadius:12,padding:18},
  capabilityIndex:{color:red,fontSize:9,fontWeight:"900"},capabilityTitle:{color:ink,fontSize:14,fontWeight:"800",marginTop:16},capabilityArrow:{color:"#9AA5B3",position:"absolute",right:17,top:16,fontSize:13},
  finalCta:{backgroundColor:"#17243A",paddingHorizontal:"8%",paddingVertical:90,alignItems:"flex-start"},finalTitle:{color:"#FFFFFF",fontSize:50,lineHeight:56,fontWeight:"900",letterSpacing:-2,maxWidth:760,marginTop:18,marginBottom:30},
  finalTitleCompact:{fontSize:36,lineHeight:41},footer:{backgroundColor:"#FFFFFF",paddingHorizontal:"8%",paddingVertical:28,flexDirection:"row",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14},
  footerBrand:{color:ink,fontSize:11,fontWeight:"900",letterSpacing:1.5},footerText:{color:muted,fontSize:10,marginTop:6},footerMeta:{color:"#98A2B0",fontSize:8,fontWeight:"800",letterSpacing:1.4}
});

function clampFont(value: number) { return value; }
