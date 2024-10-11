import NoDataUI from "@ui/NoDataUI.tsx";
import SalyIamge from "@/assets/Saly-11.svg?react";

const Default = () => {
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

export default Default;
