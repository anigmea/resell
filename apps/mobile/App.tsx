import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resell</Text>
      <Text>Mobile app — full screens in mobile spec</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title:     { fontSize: 32, fontWeight: '700', marginBottom: 12 },
})
