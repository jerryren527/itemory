import HeaderTextButton from "@/components/HeaderTextButton";
import { useThemeColors } from "@/hooks/useThemeColors";
import { consumePendingDateCallback } from "@/utils/dateSelectionBridge";
import { backModal } from "@/utils/modalNav";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ROW_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const COLUMN_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const VERTICAL_PADDING = (COLUMN_HEIGHT - ROW_HEIGHT) / 2;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function daysInMonth(year: number, month: number): number {
  // month is 1-12; day 0 of the next month is the last day of this one.
  return new Date(year, month, 0).getDate();
}

function parseDate(value?: string): { year: number; month: number; day: number } {
  if (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    }
  }
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function PickDateScreen() {
  const { value, title } = useLocalSearchParams<{ value?: string; title?: string }>();
  const initial = useMemo(() => parseDate(value), [value]);
  const colors = useThemeColors();

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list: number[] = [];
    for (let y = currentYear - 10; y <= currentYear + 20; y++) list.push(y);
    return list;
  }, []);

  const days = useMemo(() => {
    const count = daysInMonth(year, month);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [year, month]);

  const finish = (result: string) => {
    const callback = consumePendingDateCallback();
    callback?.(result);
    backModal();
  };

  const selectMonth = (newMonth: number) => {
    setMonth(newMonth);
    const maxDay = daysInMonth(year, newMonth);
    if (day > maxDay) setDay(maxDay);
  };

  const selectYear = (newYear: number) => {
    setYear(newYear);
    const maxDay = daysInMonth(newYear, month);
    if (day > maxDay) setDay(maxDay);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: title || "Select Date",
          headerLeft: () => <HeaderTextButton title="Clear" color={colors.textSecondary} onPress={() => finish("")} />,
          headerRight: () => (
            <HeaderTextButton title="Save" bold onPress={() => finish(formatDate(year, month, day))} />
          ),
        }}
      />
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "600", marginBottom: 20, color: colors.text }}>
          {MONTH_NAMES[month - 1]} {day}, {year}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <WheelColumn
            width={70}
            items={MONTH_NAMES.map((label, i) => ({ value: i + 1, label }))}
            selectedValue={month}
            onSelect={selectMonth}
          />
          <WheelColumn
            width={56}
            items={days.map((d) => ({ value: d, label: String(d) }))}
            selectedValue={day}
            onSelect={setDay}
          />
          <WheelColumn
            width={80}
            items={years.map((y) => ({ value: y, label: String(y) }))}
            selectedValue={year}
            onSelect={selectYear}
          />
        </View>
      </View>
    </>
  );
}

type WheelItem = { value: number; label: string };

function WheelColumn({
  items,
  selectedValue,
  onSelect,
  width,
}: {
  items: WheelItem[];
  selectedValue: number;
  onSelect: (value: number) => void;
  width: number;
}) {
  const colors = useThemeColors();
  const listRef = useRef<FlatList<WheelItem>>(null);
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === selectedValue),
  );

  // Keep the wheel in sync when the selection changes from outside a scroll
  // gesture on this column (e.g. picking a new month clamps the day, or the
  // day list's length changes so the same index no longer means the same value).
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: selectedIndex * ROW_HEIGHT, animated: true });
  }, [selectedIndex]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.max(
      0,
      Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT)),
    );
    const settledValue = items[index]?.value;
    if (settledValue !== undefined && settledValue !== selectedValue) {
      onSelect(settledValue);
    }
  };

  const handlePress = (index: number) => {
    listRef.current?.scrollToOffset({ offset: index * ROW_HEIGHT, animated: true });
    onSelect(items[index].value);
  };

  return (
    <View style={{ width, height: COLUMN_HEIGHT }}>
      <View
        pointerEvents="none"
        style={[styles.centerBand, { top: VERTICAL_PADDING, borderColor: colors.border }]}
      />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => String(item.value)}
        style={{ height: COLUMN_HEIGHT, width }}
        contentContainerStyle={{ paddingVertical: VERTICAL_PADDING }}
        contentOffset={{ x: 0, y: selectedIndex * ROW_HEIGHT }}
        snapToInterval={ROW_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: VERTICAL_PADDING + ROW_HEIGHT * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const isSelected = item.value === selectedValue;
          return (
            <TouchableOpacity
              onPress={() => handlePress(index)}
              style={{ height: ROW_HEIGHT, justifyContent: "center", alignItems: "center" }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: isSelected ? "700" : "400",
                  color: isSelected ? colors.tint : colors.text,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    backgroundColor: "rgba(37, 99, 235, 0.06)",
  },
});
