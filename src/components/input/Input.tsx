import { FC } from "react";

type SizeClass = "small" | "medium" | "large";

const mapSizeClasses = {
  small: "input-sm",
  medium: "input-md",
  large: "input-lg",
};

const Input: FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  size = "medium",
}) => {
  const sizeClass = mapSizeClasses[size];
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input ${sizeClass} input-bordered w-full text-gray-200 ${className}`}
    />
  );
};

interface InputProps {
  value: string | undefined;
  placeholder: string;
  type?: "text" | "password";
  className?: string;
  size?: SizeClass;
  onChange(value: string): void;
}

export default Input;
