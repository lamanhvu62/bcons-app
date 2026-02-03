import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSession } from '@/hooks/use-session';
import { formatDate } from '@/lib/format';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

type TaskRow = {
  id: string;
  title: string;
  due_at: string | null;
  done: boolean;
  leads?: { full_name: string } | null;
};

export default function TasksScreen() {
  const { session } = useSession();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setError('Thiếu cấu hình Supabase. Hãy thêm EXPO_PUBLIC_SUPABASE_URL và ANON_KEY.');
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('tasks')
      .select('id, title, due_at, done, leads(full_name)')
      .order('due_at', { ascending: true })
      .limit(30);

    if (queryError) {
      setError(queryError.message);
    } else {
      setTasks(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      void loadTasks();
    }
  }, [loadTasks, session]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Tasks</ThemedText>
        <ThemedText type="default">Theo dõi công việc cần chăm sóc lead.</ThemedText>
      </View>

      {!session ? (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Cần đăng nhập</ThemedText>
          <ThemedText type="default">
            Vui lòng đăng nhập ở tab Profile để xem danh sách công việc.
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
            data={tasks}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTasks} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loading ? (
                <ThemedView style={styles.card}>
                  <ThemedText type="subtitle">Chưa có task</ThemedText>
                  <ThemedText type="default">
                    Hãy tạo task mới trên website để đồng bộ.
                  </ThemedText>
                </ThemedView>
              ) : null
            }
            renderItem={({ item }) => (
              <ThemedView style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <ThemedText type="subtitle">{item.title}</ThemedText>
                  <ThemedView style={item.done ? styles.doneBadge : styles.todoBadge}>
                    <ThemedText type="defaultSemiBold">{item.done ? 'Done' : 'Todo'}</ThemedText>
                  </ThemedView>
                </View>
                <ThemedText type="default">
                  Lead: {item.leads?.full_name ?? 'Chưa gắn lead'}
                </ThemedText>
                <ThemedText type="default">Hạn: {formatDate(item.due_at)}</ThemedText>
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
  taskCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,150,0,0.12)',
  },
  todoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(255,165,0,0.12)',
  },
});
