import React from "react";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const NoDataUI: React.FC<Props> = ({ title, description, children }: Props) => {
  return (
    <div className=" flex justify-center items-center h-full">
      <div className="text-center">
        {children}
        <h3 className="font-semibold text-2xl w-[552px]">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default NoDataUI;
