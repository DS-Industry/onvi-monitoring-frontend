import React, { useEffect, useRef, useState } from "react";
import Filter from "../components/ui/Filter/Filter.tsx";
import ArrowDown from "../assets/icons/keyboard_arrow_down.svg?react";
import ArrowUp from "../assets/icons/keyboard_arrow_up.svg?react";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import Modal from "../components/ui/Modal";
import TableSettings from "../components/ui/Table/TableSettings.tsx";
import NoDataUI from "../components/ui/NoDataUI";
import SalyIamge from "../assets/Saly-45.svg?react";
import { columnsUser, tableUserData } from "../utils/OverFlowTableData";
import TestComponent from "../components/TestComponent";
import {useFilterOpen} from "../components/context/useContext.tsx";
import InputLineText from "../components/ui/InputLine/InputLineText.tsx";
import InputLineOption from "../components/ui/InputLine/InputLineOption.tsx";

const About = () => {
  const [isData, setIsData] = useState(true);


  return (
    <>
      <Filter>
          <div className="grid grid-cols-2 gap-6">
            <InputLineOption
                title = {"Тип"}
                type ={"typeCar"}
                name={'typeCar'}
                optionals ={[{name: "volvo", value: "Volvo"}, {name: "audi", value: "Audi"}]}
            />
            <InputLineOption
                title = {"Автомойка/ Филиал"}
                type ={"typePos"}
                name={'typePos'}
                optionals ={[{name: "volvo", value: "Volvo"}, {name: "audi", value: "Audi"}]}
            />
          </div>
        </Filter>

      {isData ? (
          <div className="mt-8">
            <OverflowTable
              tableData={tableUserData}
              columns={columnsUser}
              isDisplayEdit={true}
            />
          </div>
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
