import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth } from '../firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Chyba', 'Vyplňte všechna pole');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Úspěch', 'Přihlášení proběhlo úspěšně!');
      console.log('User logged in:', userCredential.user.email);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Nepodařilo se přihlásit';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Uživatel nenalezen';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Špatné heslo';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Neplatný email';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Neplatné přihlašovací údaje';
      }
      
      Alert.alert('Chyba', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Přihlášení
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Vítej zpět! Přihlaš se do svého účtu
            </ThemedText>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="tvuj@email.cz"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Heslo</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Tvoje heslo"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <ThemedText style={styles.loginButtonText}>
                  {loading ? 'Přihlašuji...' : 'Přihlásit se'}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Nemáš účet?{' '}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <ThemedText style={styles.link}>Zaregistruj se</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ThemedText style={styles.backButtonText}>← Zpět</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
  link: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
