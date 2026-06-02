import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum COUNTRIES {
  GET_COUNTRIES = 'user/countries',
}

export type CountryResponse = {
  id: number;
  code: string;
  name: string;
  currencyId: number;
  currency: string;
  symbol?: string;
};

export async function getCountries(): Promise<CountryResponse[]> {
  const response: AxiosResponse<CountryResponse[]> = await api.get(
    COUNTRIES.GET_COUNTRIES
  );

  return response.data;
}
