// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      {/* A rota de abas será a tela inicial. */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Se você tiver outras telas fora das abas, adicione-as aqui. */}
    </Stack>
  );
}