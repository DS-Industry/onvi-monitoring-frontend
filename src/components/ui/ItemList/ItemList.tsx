interface Item {
  id: number;
  name: string;
}

interface ItemListProps {
  title: string;
  items: Item[];
  selected: number[];
  toggleSelection: (id: number) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  title,
  items,
  selected,
  toggleSelection,
}) => {
  return (
    <div className="border rounded w-full md:w-1/3">
      <div className="flex border-b-[1px] bg-background05 text-xs">
        <div className="font-normal text-text01 p-2">{title}</div>
        <div className="ml-auto mr-2 text-text01 p-2">{items.length}</div>
      </div>
      <div className="border-b-[1px] h-64 md:h-96 overflow-y-auto w-full">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => toggleSelection(item.id)}
            className={`border-b-[1px] text-text01 pl-3 p-1 cursor-pointer ${
              selected.includes(item.id)
                ? 'bg-background06'
                : 'hover:bg-background06'
            }`}
          >
            <div className="font-light text-[11px]">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;