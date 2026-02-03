import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSession } from '@/hooks/use-session';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { session, loading } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleSignIn = async () => {
    if (!hasSupabaseConfig) {
      setAuthError('Thiếu cấu hình Supabase.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleSignUp = async () => {
    if (!hasSupabaseConfig) {
      setAuthError('Thiếu cấu hình Supabase.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText type="default">Đăng nhập để đồng bộ dữ liệu Supabase.</ThemedText>
      </View>

      {!hasSupabaseConfig ? (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Thiếu cấu hình</ThemedText>
          <ThemedText type="default">
            Thêm EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_ANON_KEY trong môi trường Expo.
          </ThemedText>
        </ThemedView>
      ) : null}

      {session ? (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Tài khoản</ThemedText>
          <ThemedText type="default">Email: {session.user.email ?? '—'}</ThemedText>
          <ThemedText type="default">User ID: {session.user.id}</ThemedText>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <ThemedText type="defaultSemiBold">
              {authLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </ThemedText>
          </Pressable>
          {authError ? <ThemedText type="default">{authError}</ThemedText> : null}
        </ThemedView>
      ) : (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Đăng nhập</ThemedText>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            autoCapitalize="none"
            placeholder="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleSignIn}
              disabled={authLoading}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                authLoading && styles.buttonDisabled,
              ]}>
              <ThemedText type="defaultSemiBold">
                {authLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleSignUp}
              disabled={authLoading}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                authLoading && styles.buttonDisabled,
              ]}>
              <ThemedText type="defaultSemiBold">Tạo tài khoản</ThemedText>
            </Pressable>
          </View>
          {authError ? <ThemedText type="default">{authError}</ThemedText> : null}
          {loading ? <ThemedText type="default">Đang kiểm tra phiên...</ThemedText> : null}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
