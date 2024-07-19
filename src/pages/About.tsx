import { useState } from "react";
import Filter from "../components/ui/Filter";
import ArrowDown from "../assets/icons/keyboard_arrow_down.svg?react";
import ArrowUp from "../assets/icons/keyboard_arrow_up.svg?react";

const About = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="flex font-semibold text-primary02"
      >
        Свернуть фильтр {filterOpen ? <ArrowDown /> : <ArrowUp />}
      </button>
      {filterOpen && <Filter />}
      <div className="mt-8">
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam,
        voluptas mollitia nesciunt ea nihil corporis dolorem labore, ratione
        odio inventore a. Numquam illum distinctio facere suscipit et, ratione
        veniam labore!
      </div>
    </>
  );
};

export default About;
