/**
 * Web: предзагрузка шрифтов иконок через expo-font, чтобы иконки отображались
 * в Telegram WebView и браузере.
 */
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export function useFontsLoaded() {
  return useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
}
