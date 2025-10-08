export interface AvatarColorScheme {
  backgroundColor: string;
  textColor: string;
}

const colorSchemes: AvatarColorScheme[] = [
  { backgroundColor: 'bg-yellow-100', textColor: 'text-yellow-700' }, 
  { backgroundColor: 'bg-green-100', textColor: 'text-green-700' },  
  { backgroundColor: 'bg-blue-100', textColor: 'text-blue-700' },    
  { backgroundColor: 'bg-purple-100', textColor: 'text-purple-700' }, 
  { backgroundColor: 'bg-pink-100', textColor: 'text-pink-700' },  
  { backgroundColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  { backgroundColor: 'bg-red-100', textColor: 'text-red-700' },     
  { backgroundColor: 'bg-orange-100', textColor: 'text-orange-700' },
  { backgroundColor: 'bg-teal-100', textColor: 'text-teal-700' },   
  { backgroundColor: 'bg-gray-100', textColor: 'text-gray-700' },    
];

export const getAvatarColors = (id: number): AvatarColorScheme => {
  const lastDigit = id % 10;
  return colorSchemes[lastDigit];
};

export const getAvatarColorClasses = (id: number): string => {
  const colors = getAvatarColors(id);
  return `${colors.backgroundColor} ${colors.textColor}`;
};
