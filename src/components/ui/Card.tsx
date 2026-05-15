import React from 'react'
import { View, Text, StyleSheet, type ViewProps, type TextProps } from 'react-native'
import { colors, radius, spacing } from '../../styles/theme'

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />
}

export function CardHeader({ style, ...props }: ViewProps) {
  return <View style={[styles.cardHeader, style]} {...props} />
}

export function CardTitle({ style, ...props }: TextProps) {
  return <Text style={[styles.cardTitle, style]} {...props} />
}

export function CardContent({ style, ...props }: ViewProps) {
  return <View style={[styles.cardContent, style]} {...props} />
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'column',
    padding: spacing[5],
    paddingBottom: spacing[2],
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  cardContent: {
    padding: spacing[5],
    paddingTop: spacing[3],
  },
})
