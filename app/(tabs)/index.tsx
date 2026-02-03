import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSession } from '@/hooks/use-session';
import { formatDate } from '@/lib/format';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

type LeadRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: string;
  source: string | null;
};

export default function LeadsScreen() {
  const { session } = useSession();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setError('Thiếu cấu hình Supabase. Hãy thêm EXPO_PUBLIC_SUPABASE_URL và ANON_KEY.');
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('leads')
      .select('id, full_name, phone, email, status, created_at, source')
      .order('created_at', { ascending: false })
      .limit(30);

    if (queryError) {
      setError(queryError.message);
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      void loadLeads();
    }
  }, [loadLeads, session]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Leads</ThemedText>
        <ThemedText type="default">Quản lý khách hàng tiềm năng theo dự án.</ThemedText>
      </View>

      {!session ? (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Cần đăng nhập</ThemedText>
          <ThemedText type="default">
            Vui lòng đăng nhập ở tab Profile để xem danh sách leads.
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          {error ? (
            <ThemedView style={styles.card}>
              <ThemedText type="subtitle">Không tải được dữ liệu</ThemedText>
              <ThemedText type="default">{error}</ThemedText>
            </ThemedView>
          ) : null}

          <FlatList
            data={leads}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadLeads} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loading ? (
                <ThemedView style={styles.card}>
                  <ThemedText type="subtitle">Chưa có lead</ThemedText>
                  <ThemedText type="default">Hãy tạo lead mới trên website để đồng bộ.</ThemedText>
                </ThemedView>
              ) : null
            }
            renderItem={({ item }) => (
              <ThemedView style={styles.leadCard}>
                <View style={styles.leadHeader}>
                  <ThemedText type="subtitle">{item.full_name}</ThemedText>
                  <ThemedView style={styles.statusBadge}>
                    <ThemedText type="defaultSemiBold">{item.status}</ThemedText>
                  </ThemedView>
                </View>
                <ThemedText type="default">
                  {item.phone ? `📞 ${item.phone}` : 'Chưa có số điện thoại'}
                </ThemedText>
                <ThemedText type="default">
                  {item.email ? `✉️ ${item.email}` : 'Chưa có email'}
                </ThemedText>
                <ThemedText type="default">Nguồn: {item.source ?? 'Chưa rõ nguồn'}</ThemedText>
                <ThemedText type="default">Ngày tạo: {formatDate(item.created_at)}</ThemedText>
              </ThemedView>
            )}
          />
        </>
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
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
  leadCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
});
