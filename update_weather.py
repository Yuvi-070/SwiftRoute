import re

file_path = r"c:\Users\YUVRAJ\OneDrive - IcareSolutions\Desktop\ff\New folder\ai-travel-planner-app\app\weather\[id].tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add LinearGradient import if missing
if "import { LinearGradient } from 'expo-linear-gradient';" not in content:
    content = content.replace("import {\n  ActivityIndicator,", "import { LinearGradient } from 'expo-linear-gradient';\nimport {\n  ActivityIndicator,")

# Add weekMin / weekMax computation
if "const weekMin = Math.min(" not in content:
    content = content.replace(
        "const upcomingDays = weather.daily.slice(1);",
        "const upcomingDays = weather.daily.slice(1);\n  const weekMin = Math.min(...weather.daily.map(d => d.minTempC));\n  const weekMax = Math.max(...weather.daily.map(d => d.maxTempC));"
    )

# Pass them to DayRow
content = content.replace(
    "<DayRow day={day} />",
    "<DayRow day={day} weekMin={weekMin} weekMax={weekMax} />"
)

# Rewrite DayRow
old_day_row = """function DayRow({ day }: { day: DailyWeather }) {
  const { theme } = useTheme();
  const iconName = WEATHER_ICONS[day.description] ?? 'cloud-outline';
  const color = WEATHER_COLORS[day.description] ?? theme.primary;

  const dateStr = new Date(day.date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View
      style={[
        styles.dayRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.dayDate, { color: theme.textPrimary }]}>{dateStr}</Text>
      <View style={[styles.dayIconSmall, { backgroundColor: color + '15' }]}>
        <Ionicons name={iconName as any} size={18} color={color} />
      </View>
      <Text style={[styles.dayDesc, { color: theme.textSecondary }]} numberOfLines={1}>
        {day.description}
      </Text>
      <Text style={[styles.dayTemp, { color: theme.textPrimary }]}>
        {day.maxTempC}°
      </Text>
      <Text style={[styles.dayTempLow, { color: theme.textTertiary }]}>
        {day.minTempC}°
      </Text>
    </View>
  );
}"""

new_day_row = """function DayRow({ day, weekMin, weekMax }: { day: DailyWeather; weekMin: number; weekMax: number }) {
  const { theme } = useTheme();
  const iconName = WEATHER_ICONS[day.description] ?? 'cloud-outline';
  const color = WEATHER_COLORS[day.description] ?? theme.primary;

  const dateStr = new Date(day.date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
  });

  // Calculate graphical bar dimensions
  const range = weekMax - weekMin || 1; // avoid div by 0
  const leftPercent = ((day.minTempC - weekMin) / range) * 100;
  const widthPercent = ((day.maxTempC - day.minTempC) / range) * 100;
  
  // Gradient colors based on temp
  const getGradient = (min: number, max: number) => {
    if (max <= 5) return ['#93C5FD', '#3B82F6']; // very cold
    if (min >= 25) return ['#F59E0B', '#EF4444']; // hot
    return ['#60A5FA', '#F59E0B']; // mild transition
  };

  return (
    <View style={[styles.dayRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.dayDate, { color: theme.textPrimary }]}>{dateStr}</Text>
      
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 28, alignItems: 'center' }}>
          <Ionicons name={iconName as any} size={20} color={color} />
        </View>
        
        <Text style={[styles.dayTempLow, { color: theme.textTertiary, width: 24, textAlign: 'right' }]}>
          {day.minTempC}°
        </Text>

        {/* Graphical Temperature Bar */}
        <View style={{ flex: 1, height: 6, backgroundColor: theme.divider, borderRadius: 3, overflow: 'hidden' }}>
          <LinearGradient
            colors={getGradient(day.minTempC, day.maxTempC)}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              width: `${Math.max(widthPercent, 5)}%`,
              height: '100%',
              borderRadius: 3,
            }}
          />
        </View>

        <Text style={[styles.dayTemp, { color: theme.textPrimary, width: 24, textAlign: 'left' }]}>
          {day.maxTempC}°
        </Text>
      </View>
    </View>
  );
}"""

content = content.replace(old_day_row, new_day_row)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Weather graphical UI applied.")
