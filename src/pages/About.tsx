import { useState } from "react";
import Filter from "../components/ui/Filter";
import ArrowDown from "../assets/icons/keyboard_arrow_down.svg?react";
import ArrowUp from "../assets/icons/keyboard_arrow_up.svg?react";
import OverflowTable from "../components/ui/OverflowTable";

const About = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="flex font-semibold text-primary02"
      >
        Свернуть фильтр {filterOpen ? <ArrowUp /> : <ArrowDown />}
      </button>
      {filterOpen && <Filter />}
      <div className="container mt-8">
        <OverflowTable />
      </div>
    </>
  );
};

export default About;
