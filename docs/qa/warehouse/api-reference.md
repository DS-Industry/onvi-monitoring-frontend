# Warehouse API reference

Клиентские вызовы раздела находятся в `src/services/api/warehouse/index.ts` и `src/services/api/sale/index.ts`. Ниже перечислены контракты, которые нужно проверять в Network и в интеграции с backend.

## Warehouse

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `user/warehouse/paginated` | Список складов с `posId`, `placementId`, `page`, `size`, `organizationId` |
| `POST` | `user/warehouse` | Создание склада |
| `GET` | `user/warehouse/nomenclature/{organizationId}` | Список номенклатуры |
| `GET` | `user/warehouse/nomenclature-count/{organizationId}` | Количество номенклатуры |
| `POST` | `user/warehouse/nomenclature` | Создание номенклатуры |
| `PATCH` | `user/warehouse/nomenclature` | Изменение номенклатуры |
| `DELETE` | `user/warehouse/nomenclature/{id}` | Удаление номенклатуры |
| `POST` | `user/warehouse/nomenclature-file` | Импорт файла номенклатуры |
| `GET` | `user/warehouse/category` | Список групп |
| `POST` | `user/warehouse/category` | Создание группы |
| `PATCH` | `user/warehouse/category/{id}` | Изменение группы |
| `GET` | `user/warehouse/supplier` | Список поставщиков |
| `GET` | `user/warehouse/supplier-count` | Количество поставщиков |
| `POST` | `user/warehouse/supplier` | Создание поставщика |
| `POST` | `user/warehouse/document` | Создание документа выбранного типа |
| `GET` | `user/warehouse/documents` | Пагинированный список документов |
| `GET` | `user/warehouse/document/{id}` | Документ и его строки |
| `POST` | `user/warehouse/document/save/{id}` | Сохранение документа |
| `POST` | `user/warehouse/document/send/{id}` | Отправка документа |
| `POST` | `user/warehouse/document/unsend/{id}` | Возврат отправленного документа |
| `DELETE` | `user/warehouse/document/{id}` | Удаление документа |
| `GET` | `user/warehouse/inventory-item/{organizationId}` | Остатки по складам |
| `GET` | `user/warehouse/inventory-item-count/{organizationId}` | Количество строк остатков |
| `GET` | `user/warehouse/inventory-item/inventory/{warehouseId}` | Номенклатура для строк документа |

## Sale prices

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `user/sale/price/{warehouseId}` | Цены номенклатуры выбранного склада |
| `POST` | `user/sale/price` | Добавление цены для номенклатуры и склада |
| `PATCH` | `user/sale/price` | Обновление цен через `valueData` |
| `DELETE` | `user/sale/price/many` | Удаление цен по массиву `ids` |

## Проверки запросов

- Все запросы должны учитывать выбранную организацию и текущие фильтры.
- Пагинированные ответы содержат `data`, `page`, `size`, `total` либо отдельный `count`.
- Документ содержит заголовок и `details` со связью `nomenclatureId` и `quantity`.
- Для `MOVING` проверяется `warehouseReceirId`; для `INVENTORY` — `oldQuantity` и `deviation`.
- Импорт отправляет файл через `multipart/form-data` с полем `file`.
