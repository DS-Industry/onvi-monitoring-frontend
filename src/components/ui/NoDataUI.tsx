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
        <div className="font-semibold text-2xl text-text01 flex justify-center items-center w-[40rem]">{title}</div>
        <p className="flex justify-center items-center text-base font-normal text-text01 w-[35rem]">{description}</p>
      </div>
    </div>
  );
};

export default NoDataUI;
