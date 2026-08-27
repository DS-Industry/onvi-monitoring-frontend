# API reference: Analytics

Все пути ниже указаны относительно API base URL и требуют авторизованной сессии.

## POS и детальные данные

| Метод | Endpoint | Использование |
|---|---|---|
| GET | `/user/pos/:id` | Профиль и тип станции |
| GET | `/user/pos/monitoring` | Депозиты устройств сети |
| GET | `/user/pos/monitoring/:posId` | Депозиты устройств станции |
| GET | `/user/device/monitoring/:deviceId` | Операции депозитного устройства |
| GET | `/user/pos/program` | Программы сети/станции |
| GET | `/user/pos/program/:posId` | Программы станции |
| GET | `/user/device/program/:deviceId` | Операции программного устройства |
| GET | `/user/pos/plan-fact/:posId/monthly` | Месячные строки план/факт |
| PATCH | `/user/pos/:id/monthly-plan` | Сохранение плана месяца |

## Overview

| Метод | Endpoint | Использование |
|---|---|---|
| GET | `/user/pos/overview/network/summary` | KPI сети |
| GET | `/user/pos/overview/network/cards` | Карточки станций |
| GET | `/user/pos/overview/:posId/summary` | KPI станции |
| GET | `/user/pos/overview/:posId/revenue-series` | Динамика выручки |
| GET | `/user/pos/overview/:posId/service-structure` | Структура услуг |
| GET | `/user/pos/overview/:posId/deposits/summary` | Сводка депозитов |
| GET | `/user/pos/overview/:posId/deposits/refunds` | Возвраты |
| GET | `/user/pos/overview/deposits/comparison` | Сравнение станций |
| GET | `/user/pos/overview/deposits/table` | Таблица депозитов |
| GET | `/user/pos/overview/:posId/loyalty/summary` | Сводка лояльности |
| GET | `/user/pos/overview/:posId/loyalty/composition` | ONVI/Yandex состав |
| GET | `/user/pos/overview/:posId/loyalty/visits` | Визиты по каналам |
| GET | `/user/pos/overview/:posId/plan-fact/summary` | KPI план/факт |
| GET | `/user/pos/overview/:posId/plan-fact/progress` | Прогресс выполнения |
| GET | `/user/pos/overview/:posId/devices` | Устройства станции |
| GET | `/user/pos/overview/:posId/cleaning/summary` | KPI очистки |
| GET | `/user/pos/overview/:posId/cleaning/by-program` | Очистка по программам |

## Общие query-параметры

`dateStart`, `dateEnd`, `organizationId`, `countryId`, `placementId`/`placementIds`, `posId`/`posIds`, `page`, `size`, `search`, `turningType`, `currencyId`.

Проверять, что даты передаются в полном ISO-формате, списки ID сериализуются через запятую, а пагинация и фильтры не теряются при переходах.
