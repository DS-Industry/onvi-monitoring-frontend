import React from "react";

const Filter: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-text04">Hello</label>
          <input
            type="text"
            placeholder="Поиск"
            className="border py-2 px-3 rounded-md w-full border-opacity01"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="cars" className="text-sm text-text02">
              Город
            </label>

            <select
              id="cars"
              className="border border-opacity01/30 py-2 px-3 rounded-md w-full bg-[#F7F9FC]"
            >
              <option label="Volvo">Volvo (Latin for "I roll")</option>
              <option label="Saab">Saab (Swedish Aeroplane AB)</option>
              <option label="Mercedes">Mercedes (Mercedes-Benz)</option>
              <option label="Audi">
                Audi (Auto Union Deutschland Ingolstadt)
              </option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="cars" className="text-sm text-text02">
              Автомойка/ Филиал
            </label>

            <select
              id="cars"
              className="border border-opacity01/30 py-2 px-3 rounded-md w-full bg-[#F7F9FC]"
            >
              <option label="Volvo">Volvo (Latin for "I roll")</option>
              <option label="Saab">Saab (Swedish Aeroplane AB)</option>
              <option label="Mercedes">Mercedes (Mercedes-Benz)</option>
              <option label="Audi">
                Audi (Auto Union Deutschland Ingolstadt)
              </option>
            </select>
          </div>
        </div>
      </div>
      <div className="my-5">
        <p className="text-sm text-text02 mb-1.5">Период</p>
        <div className="w-1/2 flex gap-2.5 text-text02">
          <div className="flex gap-2.5 items-center">
            <span>с</span>
            <input
              type="date"
              className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
            />
          </div>
          <div className="flex gap-2.5 items-center">
            <span>по</span>
            <input
              type="date"
              className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="py-2.5 px-12 text-primary02 rounded-md border border-primary02 font-semibold">
          Сбросить
        </button>
        <button className="py-2.5 px-12 text-text04 bg-primary02 rounded-md font-semibold">
          Применить
        </button>
        <p className="font-semibold">Найдено: 1</p>
      </div>
    </>
  );
};

export default Filter;
