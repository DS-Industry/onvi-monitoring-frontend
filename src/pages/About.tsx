import { useEffect, useRef, useState } from "react";
import Filter from "../components/ui/Filter";
import ArrowDown from "../assets/icons/keyboard_arrow_down.svg?react";
import ArrowUp from "../assets/icons/keyboard_arrow_up.svg?react";
import Edit from "../assets/icons/edit.svg?react";
import OverflowTable from "../components/ui/OverflowTable";
import Modal from "../components/ui/Modal";
import TableSettings from "../components/ui/TableSettings";
import NoDataUI from "../components/ui/NoDataUI";
import SalyIamge from "../assets/Saly-45.svg?react";

const tableData = [
  {
    id: 1,
    firstName: "Emily",
    lastName: "Johnson",
    middleName: "Smith",
    age: 28,
    gender: "female",
    email: "emily.johnson@x.dummyjson.com",
    phone: "+81 965-431-3024",
    username: "emilys",
    password: "emilyspass",
    birthDate: "1996-5-30",
    image: "...",
    bloodGroup: "O-",
    height: 193.24,
    weight: 63.16,
    eyeColor: "Green",
  },
  {
    id: 2,
    firstName: "Emily",
    lastName: "Johnson",
    middleName: "Smith",
    age: 28,
    gender: "female",
    email: "emily.johnson@x.dummyjson.com",
    phone: "+81 965-431-3024",
    username: "emilys",
    password: "emilyspass",
    birthDate: "1996-5-30",
    image: "...",
    bloodGroup: "O-",
    height: 193.24,
    weight: 63.16,
    eyeColor: "Green",
  },
];

const columns = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "firstName",
    key: "firstName",
  },
  {
    label: "lastName",
    key: "lastName",
  },
  {
    label: "middleName",
    key: "middleName",
  },
  {
    label: "age",
    key: "age",
  },
  {
    label: "gender",
    key: "gender",
  },
  {
    label: "email",
    key: "email",
  },
  {
    label: "phone",
    key: "phone",
  },
  {
    label: "username",
    key: "username",
  },
  {
    label: "password",
    key: "password",
  },
  {
    label: "birthDate",
    key: "birthDate",
  },
  {
    label: "image",
    key: "image",
  },
  {
    label: "bloodGroup",
    key: "bloodGroup",
  },
  {
    label: "height",
    key: "height",
  },
  {
    label: "weight",
    key: "weight",
  },
  {
    label: "eyeColor",
    key: "eyeColor",
  },
];

const About = () => {
  const [isData, setIsData] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map((col) => col.key)
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
      <button
        disabled={!isData}
        onClick={() => setFilterOpen(!filterOpen)}
        className={`flex font-semibold text-primary02 ${
          isData ? "opacity-100" : "opacity-50"
        }`}
      >
        Свернуть фильтр {filterOpen ? <ArrowUp /> : <ArrowDown />}
      </button>

      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
      >
        {filterOpen && <Filter />}
      </div>

      {isData ? (
        <>
          <div className="container mt-8">
            <OverflowTable
              tableData={tableData}
              columns={columns}
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
              columns={columns}
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
