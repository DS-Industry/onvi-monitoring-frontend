import React from "react";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const NoDataUI: React.FC<Props> = ({ title, description, children }: Props) => {
  return (
    <div className="flex justify-center items-center h-full px-4">
      <div className="text-center">
        {children}
        <div className="font-semibold text-xl sm:text-2xl text-text01 flex justify-center items-center max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
          {title}
        </div>
        <p className="flex justify-center items-center text-sm sm:text-base font-normal text-text01 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  );
};

export default NoDataUI;
