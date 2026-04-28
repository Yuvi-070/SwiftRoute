import re

file_path = r"c:\Users\YUVRAJ\OneDrive - IcareSolutions\Desktop\ff\New folder\ai-travel-planner-app\app\itinerary\[id].tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Parallax interpolation
old_interp = "translateY: interpolate(scrollY.value, [-100, 0, 100], [-50, 0, 50], Extrapolation.CLAMP),"
new_interp = "translateY: interpolate(scrollY.value, [-100, 0, 100], [-25, 0, 0], Extrapolation.CLAMP),"
content = content.replace(old_interp, new_interp)

# Add Linking import if missing
if "import { Linking," not in content and " Linking," not in content.replace(" ", ""):
    content = content.replace("import {\n  ActivityIndicator,", "import {\n  ActivityIndicator,\n  Linking,")

# Add Google Maps redirect
old_location = """                  <View style={dayStyles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={theme.textTertiary} />
                    {isEditing ? (
                      <TextInput 
                        style={[dayStyles.locationText, { color: theme.textSecondary, flex: 1, borderBottomWidth: 1, borderBottomColor: theme.border }]} 
                        value={act.location} 
                        onChangeText={(t) => updateActivity(i, 'location', t)} 
                      />
                    ) : (
                      <Text style={[dayStyles.locationText, { color: theme.textSecondary }]}>
                        {act.location}
                      </Text>
                    )}
                  </View>"""

new_location = """                  <View style={dayStyles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={theme.textTertiary} />
                    {isEditing ? (
                      <TextInput 
                        style={[dayStyles.locationText, { color: theme.textSecondary, flex: 1, borderBottomWidth: 1, borderBottomColor: theme.border }]} 
                        value={act.location} 
                        onChangeText={(t) => updateActivity(i, 'location', t)} 
                      />
                    ) : (
                      <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`)} style={{ flex: 1 }}>
                        <Text style={[dayStyles.locationText, { color: theme.primary, textDecorationLine: 'underline' }]}>
                          {act.location}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>"""

content = content.replace(old_location, new_location)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Itinerary fixes applied.")
