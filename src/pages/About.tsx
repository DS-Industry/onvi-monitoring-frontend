import { useEffect, useRef, useState } from "react";
import Filter from "../components/ui/Filter";
import ArrowDown from "../assets/icons/keyboard_arrow_down.svg?react";
import ArrowUp from "../assets/icons/keyboard_arrow_up.svg?react";
import Edit from "../assets/icons/edit.svg?react";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import Modal from "../components/ui/Modal";
import TableSettings from "../components/ui/Table/TableSettings.tsx";
import NoDataUI from "../components/ui/NoDataUI";
import SalyIamge from "../assets/Saly-45.svg?react";
import { columnsUser, tableUserData } from "../utils/OverFlowTableData";
import TestComponent from "../components/TestComponent";
import {useFilterOpen} from "../components/context/useContext.tsx";

const About = () => {
  const [isData, setIsData] = useState(true);
  const { filterOpen, setFilterOpen} = useFilterOpen();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
      columnsUser.map((col) => col.key)
  );

  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
    <>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
      >
        {filterOpen && <Filter />}
      </div>

      {isData ? (
        <>
          <div className="mt-8">
            <OverflowTable
              tableData={tableUserData}
              columns={columnsUser}
              selectedColumns={selectedColumns}
            />
          </div>
          <button
            onClick={openModal}
            className="text-primary02 text-sm font-semibold flex items-center gap-2 mt-1.5 py-2"
          >
            Настройки таблицы <Edit />
          </button>

          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <TableSettings
              columns={columnsUser}
              selectedColumns={selectedColumns}
              onColumnToggle={handleColumnToggle}
              onIsModalOpen={closeModal}
            />
          </Modal>
        </>
      ) : (
        <NoDataUI
          title="В этом разделе представлена статистика уборки постов"
          description="Данные вводятся автоматически "
        >
          <SalyIamge className="mx-auto" />
        </NoDataUI>
      )}
    </>
  );
};

export default About;
