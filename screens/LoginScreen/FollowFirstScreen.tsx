import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
// 👇 THÊM IMPORT NÀY
import { useAuth } from '@/contexts/AuthContext'
import { AuthStackParamList } from '@/navigation/AuthStack'
import { authAPI, usersAPI } from '@/services/api'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { router } from 'expo-router'

// 👇 TYPE CHO SCREEN
type Props = NativeStackScreenProps<AuthStackParamList, 'FollowFirst'>

interface UserSummary {
  id: number
  username: string
  display_name: string
  avatar_url: string
  is_following: boolean
}

export default function FollowFirstScreen({ navigation }: Props) {
  const [following, setFollowing] = useState<UserSummary[]>([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<UserSummary[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<number | null>(null)
  const { login } = useAuth()
  const [meId, setMeId] = useState<number | null>(null)

  useEffect(() => {
    // load current user and their following list
    const load = async () => {
      setLoading(true)
      try {
        const meRes = await authAPI.me()
        const user = meRes.data
        setMeId(user.id)
        const res = await usersAPI.getFollowing(user.id, null, 100)
        setFollowing(res.data.users || [])
      } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    // debounce search
    if (!search) {
      setResults(null)
      setSearching(false)
      return
    }

    setSearching(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await usersAPI.search(search, 50)
        setResults(res.data.users || [])
      } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.error?.message || 'Search failed')
      } finally {
        setSearching(false)
      }
    }, 300) as unknown as number

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const onFollow = async (userId: number) => {
    try {
      // optimistic update: add to following list with a minimal user object
      const already = following.find(u => u.id === userId)
      if (already) return

      // call API
      await usersAPI.follow(userId)

      // if we had the user info in results, use it; otherwise, create a placeholder
      const fromResults = results?.find(u => u.id === userId)
      const newUser: UserSummary =
        fromResults ?? ({ id: userId, username: '', display_name: '', avatar_url: '', is_following: true })

      setFollowing(prev => [ { ...newUser, is_following: true }, ...prev ])

      // update results list's is_following if present
      if (results) {
        setResults(prev => prev?.map(r => (r.id === userId ? { ...r, is_following: true } : r)) ?? null)
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to follow')
    }
  }

  const onUnfollow = async (userId: number) => {
    try {
      await usersAPI.unfollow(userId)
      setFollowing(prev => prev.filter(u => u.id !== userId))
      if (results) {
        setResults(prev => prev?.map(r => (r.id === userId ? { ...r, is_following: false } : r)) ?? null)
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to unfollow')
    }
  }

  const totalFollowing = following.length
  const [confirming, setConfirming] = useState(false)

  const onConfirm = async () => {
    if (totalFollowing < 2) return
    setConfirming(true)
    try {
      await authAPI.completeOnboarding()
      // mark user as logged in and navigate to main home
      login()
      router.replace('/(tabs)/home')
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to complete onboarding')
    } finally {
      setConfirming(false)
    }
  }

  const renderItem = ({ item }: { item: UserSummary }) => {
    return (
      <View style={styles.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#eee' }]} />
          )}

          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontWeight: '600' }}>{item.display_name || item.username}</Text>
            <Text style={{ color: '#666' }}>@{item.username}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.followBtn, item.is_following ? styles.unfollowBtn : null]}
          onPress={() => (item.is_following ? onUnfollow(item.id) : onFollow(item.id))}
        >
          <Text style={{ color: '#fff' }}>{item.is_following ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Follow ít nhất 2 người</Text>

      <TextInput
        placeholder="Tìm người (username)"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={results ?? following}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
              {results ? (searching ? 'Đang tìm...' : 'Không có kết quả') : 'Bạn chưa follow ai'}
            </Text>
          )}
        />
      )}

      <TouchableOpacity
        disabled={totalFollowing < 2 || confirming}
        style={[styles.confirm, totalFollowing >= 2 && styles.confirmActive]}
        onPress={onConfirm}
      >
        {confirming ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff' }}>Xác nhận ({totalFollowing}/2)</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  search: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  followBtn: {
    backgroundColor: '#3797ef',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unfollowBtn: { backgroundColor: '#999' },
  confirm: {
    backgroundColor: '#ccc',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  confirmActive: { backgroundColor: '#3797ef' },
})
