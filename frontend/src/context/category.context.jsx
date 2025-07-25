import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CategoryContext = createContext({
  categories: [],
  loading: true,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => {
        console.error("Failed to fetch categories", err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};
