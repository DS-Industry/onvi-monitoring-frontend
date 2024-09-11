import NoDataUI from "../components/ui/NoDataUI.tsx";
import React from "react";
import SalyIamge from "../assets/Saly-11.svg?react";

const Contact = () => {
  return (
      <div >
          <NoDataUI
              title="Страница в разработке"
              description="Возвращайтесь позже"
          >
            <SalyIamge className="mx-16"/>
          </NoDataUI>
      </div>
  )
};

export default Contact;
