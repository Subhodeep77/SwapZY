import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const SearchInput = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input) {
        searchParams.set("search", input);
      } else {
        searchParams.delete("search");
      }
      searchParams.set("page", "1"); // Reset page on search
      setSearchParams(searchParams);
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [input, searchParams, setSearchParams]);

  return (
    <div className="w-full max-w-xl mx-auto mb-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="🔍 Search products by title, description, tags..."
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>
  );
};

export default SearchInput;
