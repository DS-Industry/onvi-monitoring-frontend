import React from "react";
import InputLineText from "./InputLine/InputLineText.tsx";
import InputLineOption from "./InputLine/InputLineOption.tsx";

const Filter: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <InputLineText
          title = {"Поиск"}
          placeholder ={"Поиск"}/>
        <div className="grid grid-cols-2 gap-6">
          <InputLineOption
            title = {"Тип"}
            type ={"typeCar"}
            optionals ={["Volvo", "Audi"]}
            />
          <InputLineOption
              title = {"Автомойка/ Филиал"}
              type ={"typePos"}
              optionals ={["Volvo", "Audi"]}
          />
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
