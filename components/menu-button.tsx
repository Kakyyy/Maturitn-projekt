import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface MenuButtonProps {
  onPress: () => void;
  color?: string;
}

export default function MenuButton({ onPress, color = '#fff' }: MenuButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name="menu" size={28} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginLeft: 8,
  },
});
