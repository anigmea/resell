import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upcoming Events</Text>
      <Text>Full implementation in mobile spec.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  heading:   { fontSize: 24, fontWeight: '700', marginBottom: 12 },
})
