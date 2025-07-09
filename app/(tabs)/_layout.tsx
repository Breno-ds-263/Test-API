import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import React from 'react';

import {
  Code,
  CodeSimple,
  House,
  HouseLine,
  MapPinLine,
  MapTrifold,
  User,
  UserCircle,
} from 'phosphor-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <House weight="fill" color={color} size={24} />
            ) : (
              <HouseLine weight="regular" color={color} size={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MapTrifold weight="fill" color={color} size={24} />
            ) : (
              <MapPinLine weight="regular" color={color} size={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Code weight="fill" color={color} size={24} />
            ) : (
              <CodeSimple weight="regular" color={color} size={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <User weight="fill" color={color} size={24} />
            ) : (
              <UserCircle weight="regular" color={color} size={24} />
            ),
        }}
      />
    </Tabs>
  );
}
