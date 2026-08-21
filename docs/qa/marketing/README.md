# QA: раздел Marketing (Маркетинг)

Документация для тестировщиков и менеджеров продукта по разделу **Маркетинг**.

## Как читать документы

В файлах `01`–`07` порядок блоков:

1. **О странице** — зачем экран, что менеджерит, кто пользуется, связи, правила.
2. **Тест-кейсы (ТК-*)** — предусловия + таблица **Шаг | Действие | Ожидаемый результат**.

Общая модель и словарь: [00-overview.md](./00-overview.md).  
Чеклист прогона: [qa-checklist.md](./qa-checklist.md).  
HTTP-справка: [api-reference.md](./api-reference.md).

Домен backend (полный репозиторий):  
`/Users/dianasparynyak/Desktop/onvi_monitoring_backend` → `src/core/loyalty-core/`.

## Предусловия для теста

1. План организации **BUSINESS** или **CUSTOM**.
2. Права по subject **`LTYProgram`** (на экране указано, какие именно).
3. Выбрана организация в сессии.
4. **Корпоративные клиенты** — тариф `CORPORATE_CLIENTS`.
5. **Промокоды** — тариф `ONVI`.

## Оглавление сценариев

| Документ | Экраны |
|----------|--------|
| [00-overview.md](./00-overview.md) | Модель раздела, словарь, доступы |
| [01-clients.md](./01-clients.md) | Клиенты + импорт + профиль (контекст + ТК) |
| [02-corporate-clients.md](./02-corporate-clients.md) | Корп. клиенты (контекст + ТК) |
| [03-campaigns.md](./03-campaigns.md) | Кампании (контекст + ТК) |
| [04-loyalty.md](./04-loyalty.md) | Программы лояльности (контекст + ТК) |
| [05-cards-transactions.md](./05-cards-transactions.md) | Карты и заказы (контекст + ТК) |
| [06-promo-codes.md](./06-promo-codes.md) | Промокоды (контекст + ТК) |
| [07-segments-wip.md](./07-segments-wip.md) | Сегменты WIP |

| [api-reference.md](./api-reference.md) | Справочник HTTP (для отладки Network) |
| [qa-checklist.md](./qa-checklist.md) | Сводный чеклист Pass/Fail |

## Быстрая карта меню

| Пункт меню | Куда ведёт |
|------------|------------|
| Клиенты | `/marketing/clients` |
| Корпоративные клиенты | `/marketing/corporate-clients` |
| Маркетинговые кампании | `/marketing/campaigns` |
| Программа лояльности | `/marketing/loyalty` |
| Пользователи | `/marketing/cards` |
| Заказы | `/marketing/marketing-transactions` |
| Управление промокодами | `/marketing/promo-code-management` |

Источники: фронт `src/routes/index.tsx`, `src/pages/Marketing/`, `src/services/api/marketing/index.ts`; backend Desktop `loyalty-core`.
