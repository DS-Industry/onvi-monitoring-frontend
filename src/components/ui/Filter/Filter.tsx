import React, {useEffect, useRef, useState} from "react";
import InputLineText from "../InputLine/InputLineText.tsx";
import InputLineOption from "../InputLine/InputLineOption.tsx";
import {useFilterOpen} from "../../context/useContext.tsx";

type Props = {
  children: React.ReactNode;
  count: number;
};
const Filter: React.FC<Props> = ({
    children,
    count,
}:Props) => {

    const { filterOpen, setFilterOpen} = useFilterOpen();
    const contentRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState();

    useEffect(() => {
        if (filterOpen) {
            if (contentRef.current) {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
            }
        } else {
            if (contentRef.current) {
                contentRef.current.style.maxHeight = "0";
            }
        }
    }, [filterOpen]);

  return (
      <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
      >
          {children}

      <div className="flex items-center gap-6">
        <button className="py-2.5 px-12 text-primary02 rounded-md border border-primary02 font-semibold">
          Сбросить
        </button>
        <button className="py-2.5 px-12 text-text04 bg-primary02 rounded-md font-semibold">
          Применить
        </button>
        <p className="font-semibold">Найдено: {count}</p>
      </div>
      </div>
  );
};

export default Filter;
