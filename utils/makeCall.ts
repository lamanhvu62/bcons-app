import { Alert, Linking } from 'react-native';

export async function makeCall(phone?: string | null) {
  if (!phone) {
    Alert.alert('Số điện thoại không tồn tại', 'Không thể gọi khách hàng này.');
    return;
  }
  const digits = phone.replace(/\s+/g, '');
  const tel = `tel:${digits}`;
  try {
    const supported = await Linking.canOpenURL(tel);
    if (supported) {
      await Linking.openURL(tel);
    } else {
      Alert.alert('Thiết bị không hỗ trợ', 'Không thể thực hiện cuộc gọi.');
    }
  } catch (err) {
    Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi.');
  }
}
