export const FINTABLO_ERROR_TYPE = 'api_fintablo';

type FinTabloErrorBody = {
  type?: string;
  message?: unknown;
};

type AxiosLikeError = {
  response?: {
    data?: unknown;
  };
};

function getErrorBody(error: unknown): FinTabloErrorBody | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const data = (error as AxiosLikeError).response?.data;
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  return data as FinTabloErrorBody;
}

export function getApiErrorMessage(error: unknown): string | undefined {
  const body = getErrorBody(error);
  if (!body || typeof body.message !== 'string') {
    return undefined;
  }

  const message = body.message.trim();
  return message.length > 0 ? message : undefined;
}

export function getFinTabloErrorMessage(error: unknown): string | undefined {
  const body = getErrorBody(error);
  if (!body || body.type !== FINTABLO_ERROR_TYPE) {
    return undefined;
  }

  return getApiErrorMessage(error);
}
