import React from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DevMenuButton } from '../../features/conversation/components/DevMenu';
import { colors } from '../../shared/theme';
import { ChatScreen } from '../screens/ChatScreen';

export type RootStackParamList = {
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const renderDevMenu = () => <DevMenuButton />;

function ChatRoute() {
  return <ChatScreen keyboardOffset={useHeaderHeight()} />;
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: { color: colors.text },
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Chat"
          component={ChatRoute}
          options={{ title: 'AI Astrologer', headerRight: renderDevMenu }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
