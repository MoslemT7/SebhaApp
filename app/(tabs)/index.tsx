import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
I18nManager.forceRTL(true); // RTL support

export default function App() {
  const [count, setCount] = useState(0);
  const [phrase, setPhrase] = useState<string>('سبحان الله');
  const [customPhrase, setCustomPhrase] = useState('');
  const [customDuaas, setCustomDuaas] = useState<string[]>([]);
  const [goal, setGoal] = useState<number>(33);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [customGoals, setCustomGoals] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState('00:00');
  const [darkMode, setDarkMode] = useState(false);

  const colors = darkMode
    ? {
        bg: '#111',
        text: '#ffffff',
        subText: '#aaa',
        inputBg: '#1f1f1f',
        boxBg: '#222',
        btnBg: '#4caf50',
        border: '#444',
        del: 'tomato',
      }
    : {
        bg: '#fff9f0',
        text: '#000',
        subText: '#777',
        inputBg: '#f7f3eb',
        boxBg: '#f2f2f2',
        btnBg: '#4caf50',
        border: '#ccc',
        del: 'red',
      };

  useEffect(() => {
    loadCustomDuaas();
    loadCustomGoals();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (startTime !== null) {
      timer = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(diff / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        setElapsed(`${mins}:${secs}`);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime]);

  const loadCustomDuaas = async () => {
    const saved = await AsyncStorage.getItem('customDuaas');
    if (saved) setCustomDuaas(JSON.parse(saved));
  };

  const saveCustomDuaas = async (list: string[]) => {
    await AsyncStorage.setItem('customDuaas', JSON.stringify(list));
  };

  const handleAddDuaa = () => {
    const text = customPhrase.trim();
    if (!text) return;
    if (customDuaas.includes(text)) {
      Alert.alert('⚠️ موجود بالفعل', 'هذا الدعاء تمت إضافته مسبقًا.');
      return;
    }
    const updated = [...customDuaas, text];
    setCustomDuaas(updated);
    saveCustomDuaas(updated);
    setPhrase(text);
    setCustomPhrase('');
  };

  const handleDeleteDuaa = (duaa: string) => {
    Alert.alert('❌ حذف', `هل تريد حذف الدعاء "${duaa}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          const updated = customDuaas.filter(item => item !== duaa);
          setCustomDuaas(updated);
          saveCustomDuaas(updated);
          if (phrase === duaa) setPhrase('سبحان الله');
        },
      },
    ]);
  };

  const handlePress = () => {
    if (startTime === null) setStartTime(Date.now());
    const newCount = count + 1;
    setCount(newCount);
    if (newCount === goal) {
      Vibration.vibrate(500);
    }
  };

  const handleReset = () => {
    setCount(0);
    setStartTime(null);
    setElapsed('00:00');
  };

  const loadCustomGoals = async () => {
    const stored = await AsyncStorage.getItem('customGoals');
    if (stored) setCustomGoals(JSON.parse(stored));
  };

  const saveCustomGoals = async (goals: number[]) => {
    await AsyncStorage.setItem('customGoals', JSON.stringify(goals));
  };

  const handleAddCustomGoal = () => {
    const parsed = parseInt(customGoalInput.trim());
    if (isNaN(parsed) || parsed <= 0) return;
    if (!customGoals.includes(parsed)) {
      const updated = [...customGoals, parsed].sort((a, b) => a - b);
      setCustomGoals(updated);
      saveCustomGoals(updated);
    }
    setGoal(parsed);
    setCustomGoalInput('');
  };

  const finalPhrase = customPhrase.trim() !== '' ? customPhrase : phrase;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg}]}>
      <Text style={[styles.label, { color: colors.text }]}>اختر الدعاء من القائمة:</Text>
      <Picker selectedValue={phrase} onValueChange={setPhrase} style={[styles.picker,  { backgroundColor: colors.inputBg }]}>
        <Picker.Item label="لا إله إلا الله" value="لا إله إلا الله" />
        <Picker.Item label="الحمد لله" value="الحمد لله" />
        <Picker.Item label="سبحان الله" value="سبحان الله" />
        <Picker.Item label="الله أكبر" value="الله أكبر" />
        {customDuaas.map((duaa, i) => (
          <Picker.Item key={i} label={duaa} value={duaa} />
        ))}
      </Picker>

      <Text style={[styles.label, { color: colors.text }]}>أو أدخل دعاءً مخصصًا:</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
        placeholder="أدخل دعاءً مخصصًا"
        placeholderTextColor={colors.subText}
        value={customPhrase}
        onChangeText={setCustomPhrase}
        textAlign="right"
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.btnBg }]} onPress={handleAddDuaa}>
        <Text style={styles.buttonText}>➕ إضافة الدعاء</Text>
      </TouchableOpacity>

      {customDuaas.length > 0 && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>📜 الأدعية المخصصة:</Text>
          <FlatList
            data={customDuaas}
            keyExtractor={item => item}
            style={{ width: '100%', marginBottom: 20 }}
            renderItem={({ item }) => (
              <View style={[styles.duaaRow, { backgroundColor: colors.boxBg}]}>
                <Text style={[styles.duaaText, { color: colors.text }]}>{item}</Text>
                <TouchableOpacity onPress={() => handleDeleteDuaa(item)}>
                  <Text style={{ fontSize: 18, color: colors.del }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}

      <TouchableOpacity onPress={handlePress} onLongPress={handleReset} activeOpacity={0.7}>
        <Text style={[styles.phrase, { color: colors.text }]}>{finalPhrase}</Text>
        <Text style={[styles.count, { color: '#4caf50' }]}>{count}</Text>
        <Text style={[styles.timer, { color: colors.subText }]}>⏱️ الوقت المستغرق: {elapsed}</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>اختر الهدف:</Text>
      <View style={styles.goalRow}>
        <Picker
          selectedValue={goal}
          onValueChange={setGoal}
          style={[styles.pickerGoal,  { backgroundColor: colors.inputBg }]}
        >
          <Picker.Item label="33" value={33} />
          <Picker.Item label="50" value={50} />
          <Picker.Item label="100" value={100} />
          {customGoals.map((g, i) => (
            <Picker.Item key={i} label={`${g}`} value={g} />
          ))}
        </Picker>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, width: '40%' }]}
          placeholder="هدف مخصص"
          placeholderTextColor={colors.subText}
          value={customGoalInput}
          onChangeText={setCustomGoalInput}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.btnBg }]} onPress={handleAddCustomGoal}>
        <Text style={styles.buttonText}>➕ إضافة الهدف</Text>
      </TouchableOpacity>

      {/* Night Mode Toggle */}
      <TouchableOpacity style={styles.fab} onPress={() => setDarkMode(!darkMode)}>
        <Text style={styles.fabText}>{darkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    writingDirection: 'rtl',
  },
  picker: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 10,
  },
  pickerGoal: {
    width: '50%',
    marginBottom: 16,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    writingDirection: 'rtl',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    writingDirection: 'rtl',
  },
  duaaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  duaaText: {
    fontSize: 16,
  },
  phrase: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 20,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  count: {
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  goalRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 25,
    padding: 12,
    elevation: 10,
  },
  fabText: {
    fontSize: 22,
    color: '#fff',
  },
});
