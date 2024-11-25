import React, { useEffect, useRef } from "react";
import { useFilterOpen } from "@/components/context/useContext.tsx";

type Props = {
  children: React.ReactNode;
  count: number;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
};
const Filter: React.FC<Props> = ({
  children,
  count,
  searchTerm,
  setSearchTerm
}: Props) => {

  const { filterOpen } = useFilterOpen();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filterOpen) {
      contentRef.current!.style.maxHeight = "none"; // Allow natural height
    } else {
      contentRef.current!.style.maxHeight = "0";
    }
  }, [filterOpen]);

  const handleReset = () => {
    if (setSearchTerm)
      setSearchTerm('');
  }
  const handleApply = () => {
    if (setSearchTerm && searchTerm)
      setSearchTerm(searchTerm);
  }


  return (
    <div
      ref={contentRef}
      className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
    >
      {children}

      <div className="flex items-center gap-6">
        <button className="py-2.5 px-12 text-primary02 rounded-md border border-primary02 font-semibold" onClick={handleReset}>
          Сбросить
        </button>
        <button className="py-2.5 px-12 text-text04 bg-primary02 rounded-md font-semibold" onClick={handleApply}>
          Применить
        </button>
        <p className="font-semibold">Найдено: {count}</p>
      </div>
    </div>
  );
};

export default Filter;
