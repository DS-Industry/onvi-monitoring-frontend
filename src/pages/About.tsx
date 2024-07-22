import { useEffect, useRef, useState } from "react";
import Filter from "../components/ui/Filter";
import ArrowDown from "../assets/icons/keyboard_arrow_down.svg?react";
import ArrowUp from "../assets/icons/keyboard_arrow_up.svg?react";
import Edit from "../assets/icons/edit.svg?react";
import OverflowTable from "../components/ui/OverflowTable";

const About = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (filterOpen) {
      if (contentRef.current) {
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
      }
    } else {
      if (contentRef.current) {
        contentRef.current.style.maxHeight = '0';
      }
    }
  }, [filterOpen]);

  return (
    <>
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="flex font-semibold text-primary02"
      >
        Свернуть фильтр {filterOpen ? <ArrowUp /> : <ArrowDown />}
      </button>
      <div
     ref={contentRef}
     className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
      >
        {filterOpen && <Filter />}
      </div>
      <div className="container mt-8">
        <OverflowTable />
      </div>
      <button className="text-primary02 text-sm font-semibold flex gap-2 mt-1.5 py-2">
        Настройки таблицы <Edit />
      </button>
    </>
  );
};

export default About;
