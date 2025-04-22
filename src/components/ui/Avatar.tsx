import React from "react";

type Props = {
    type: "profile" | "sidebar",
    initials: string,
};

const Avatar: React.FC<Props> = ({ type, initials }: Props) => {

    return (
        <div className={`${type === "profile" ? "w-36 h-36" : "w-12 h-12"} rounded-full bg-[#bffa00] flex items-center justify-center`}>
            <span className="text-sm text-black">{initials}</span>
        </div>
    );
};

export default Avatar;
