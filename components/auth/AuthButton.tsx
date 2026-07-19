interface Props {
  loading: boolean;
  text: string;
}

export default function AuthButton({ loading, text }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        w-full
        rounded-xl
        bg-blue-600
        py-3
        text-white
        font-semibold
        hover:bg-blue-700
        disabled:opacity-60
        transition
      "
    >
      {loading ? "Please wait..." : text}
    </button>
  );
}
