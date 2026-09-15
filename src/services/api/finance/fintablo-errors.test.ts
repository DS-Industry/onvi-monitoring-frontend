/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, getFinTabloErrorMessage } from './fintablo-errors';

describe('getFinTabloErrorMessage', () => {
  it('should return API message when type is api_fintablo', () => {
    const error = {
      response: {
        data: {
          type: 'api_fintablo',
          code: 551,
          message: 'Направление «АМС» не найдено',
        },
      },
    };

    expect(getFinTabloErrorMessage(error)).toBe('Направление «АМС» не найдено');
  });

  it('should return undefined when type is not api_fintablo', () => {
    const error = {
      response: {
        data: {
          type: 'api_server',
          code: 551,
          message: 'Internal server error',
        },
      },
    };

    expect(getFinTabloErrorMessage(error)).toBeUndefined();
  });

  it('should return undefined when message is empty', () => {
    const error = {
      response: {
        data: {
          type: 'api_fintablo',
          message: '   ',
        },
      },
    };

    expect(getFinTabloErrorMessage(error)).toBeUndefined();
  });
});

describe('getApiErrorMessage', () => {
  it('should return message when body has a non-empty message', () => {
    const error = {
      response: {
        data: {
          message: 'Группа типа не совпадает с группой проводки',
        },
      },
    };

    expect(getApiErrorMessage(error)).toBe(
      'Группа типа не совпадает с группой проводки'
    );
  });

  it('should return undefined when message is missing', () => {
    expect(getApiErrorMessage({ response: { data: { code: 400 } } })).toBeUndefined();
  });
});
