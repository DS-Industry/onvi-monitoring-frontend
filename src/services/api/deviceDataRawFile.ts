import api from '@/config/axiosConfig';

export async function registerDeviceDataRawFile(key: string): Promise<void> {
  await api.post('/user/device/data-raw-file', { key });
}
