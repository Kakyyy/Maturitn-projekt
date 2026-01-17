import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDrawer } from '@/contexts/DrawerContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Animated, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/(tabs)', label: 'Domů', icon: 'home' },
  { path: '/(tabs)/explore', label: 'Hledat cviky', icon: 'search' },
  { path: '/(tabs)/muscleselect', label: 'Výběr cviků', icon: 'fitness-center' },
  { path: '/(tabs)/new-workout', label: 'Nový trénink', icon: 'add-circle' },
  { path: '/(tabs)/profile', label: 'Profil', icon: 'person' },
];

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkNavigationAllowed } = useDrawer();
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNavigate = async (path: string) => {
    // Pokud již jsme na této stránce, jen zavřeme drawer
    if (pathname === path || pathname.startsWith(path)) {
      onClose();
      return;
    }
    
    const allowed = await checkNavigationAllowed();
    if (allowed) {
      onClose();
      setTimeout(() => {
        router.push(path as any);
      }, 200);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <ThemedView style={styles.drawerContent}>
            <View style={styles.header}>
              <ThemedText style={styles.logoText}>
                Power<ThemedText style={styles.logoTextAccent}>Gainz</ThemedText>
              </ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path);
                return (
                  <TouchableOpacity
                    key={item.path}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => handleNavigate(item.path)}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={24}
                      color={isActive ? '#D32F2F' : '#fff'}
                    />
                    <ThemedText
                      style={[styles.menuItemText, isActive && styles.menuItemTextActive]}
                    >
                      {item.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: 280,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingRight: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  logoTextAccent: {
    color: '#D32F2F',
    fontWeight: '900',
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  menuItemActive: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  menuItemTextActive: {
    color: '#D32F2F',
  },
});
