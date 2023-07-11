import { ChangeEvent, FC } from "react";

const SelectList: FC<SelectListProps> = ({ title, items, onChange }) => {
  if (!items) return null;
  return (
    <div className="py-2.5">
      <select
        onChange={onChange}
        className="h-10 w-full rounded border-r-8 border-transparent px-4 text-sm outline outline-neutral-700"
      >
        <option value="">{title}</option>
        {Object.entries(items).map(([key, value], index) => (
          <option key={index} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};

interface SelectListProps {
  title: string;
  items: Record<string, any>;
  onChange(event: ChangeEvent<HTMLSelectElement>): void;
}

export default SelectList;
