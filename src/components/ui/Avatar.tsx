import React from 'react';

type Props = {
  type: 'profile' | 'sidebar';
  userName: {
    name: string;
    middlename: string | undefined;
  };
};

const Avatar: React.FC<Props> = ({ type, userName }: Props) => {
  const initials =
    (userName.name?.[0]?.toUpperCase() || '') +
      (userName.middlename?.[0]?.toUpperCase() || '') ||
    userName.name?.[0]?.toUpperCase() ||
    '';

  return (
    <div
      className={`${type === 'profile' ? 'w-36 h-36' : 'w-12 h-12'} rounded-full bg-[#bffa00] flex items-center justify-center`}
    >
      <span
        className={`${type === 'profile' ? 'text-4xl font-bold' : 'text-sm'} text-black`}
      >
        {initials}
      </span>
    </div>
  );
};

export default Avatar;
