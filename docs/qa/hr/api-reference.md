# HR API reference (из фронта)

Источник: `src/services/api/hr/index.ts`.  
Base prefix: `user/hr/...`.  
Документ для QA: сверка Network tab ↔ экран.

Без секретов и реальных хостов.

## Workers

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createWorker` | POST | `user/hr/worker` (multipart) | Сотрудники, drawer |
| `updateWorker` | PATCH | `user/hr/worker` (multipart) | Профиль |
| `getWorkers` | GET | `user/hr/workers` | Списки, табель, фильтры |
| `getWorkersCount` | GET | `user/hr/workers-count` | Пагинация списка |
| `getWorkerById` | GET | `user/hr/worker/{id}` | Профиль |
| `updateWorkerPosConnections` | PATCH | `user/hr/worker/pos-connection` | Профиль, точки |
| `getWorkerConnectedPoses` | GET | `user/hr/worker/{workerId}/poses` | Профиль, точки |

Query `getWorkers`: `placementId`, `hrPositionId`, `organizationId`, `posId`, `name`, `page`, `size`. Поле `status` на фронте **не передаётся** → сервер подставляет `WORKS`.

## Positions

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createPosition` | POST | `user/hr/position` | Должности, drawer |
| `updatePosition` | PATCH | `user/hr/position` | Должности, inline |
| `getPositions` | GET | `user/hr/positions` | Должности, формы HR |
| `getPositionById` | GET | `user/hr/position/{id}` | (клиент есть; экран списка не зовёт) |

## Prepayment (аванс)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `calculatePrepayment` | POST | `user/hr/prepayment/calculate` | Создание аванса, «Сформировать» |
| `addWorkerPrePayment` | POST | `user/hr/prepayment/calculate/workers` | «Добавить сотрудника» |
| `createPrepayment` | POST | `user/hr/prepayment` | Сохранение аванса |
| `updatePrepayment` | PATCH | `user/hr/prepayment` | Список авансов |
| `deletePrepayments` | DELETE | `user/hr/prepayment/many` | Список авансов |
| `getPrepayments` | GET | `user/hr/prepayments` | Список авансов |
| `getPrepaymentsCount` | GET | `user/hr/prepayments/count` | Пагинация |

Body calculate: `organizationId`, `billingMonth`, опционально `hrPositionId`.

## Payment (ЗП)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `calculatePayment` | POST | `user/hr/payment/calculate` | Создание ЗП, «Сформировать» |
| `addWorkerPayment` | POST | `user/hr/payment/calculate/workers` | «Добавить сотрудника» |
| `createPayment` | POST | `user/hr/payment` | Сохранение ЗП |
| `updatePayment` | PATCH | `user/hr/payment` | Список ЗП |
| `deletePayments` | DELETE | `user/hr/payment/many` | Список ЗП |
| `getPayments` | GET | `user/hr/payments` | Список ЗП |
| `getPaymentsCount` | GET | `user/hr/payments/count` | Пагинация |

Create ЗП: в элементе `prize`, `fine` обязательны; `virtualSum`, `comment` опциональны.  
В типе update на фронте поле `vitrualSum` (опечатка) — сверять фактический JSON в Network.

## Смежные (не HR-модуль, вход для расчёта)

| Назначение | Где на фронте |
|------------|----------------|
| Табель смен | `src/pages/Finance/Timesheet.tsx` — `GET`/`POST` shift-reports |
| Стоимость смен АМС | `ShiftCost.tsx` — `PATCH user/pos/{id}/position-salary-rate` |

## Backend (ориентир)

Контроллер: `src/app/platform-user/core-controller/hr.ts` (`C:\Bychenko\monitoring-system-backend`).  
CASL subject `Hr`. Подписка: feature `Hr`.
