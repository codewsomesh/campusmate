interface Props {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export default function AuthInput({
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full
        rounded-xl
        border
        border-gray-300
        bg-white
        text-gray-800
        placeholder:text-gray-400
        px-4
        py-3
        outline-none
        transition
        focus:border-blue-600
        focus:ring-4
        focus:ring-blue-100
      "
    />
  );
}
