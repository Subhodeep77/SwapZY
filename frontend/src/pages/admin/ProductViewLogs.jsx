import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import PageHelmet from "../../components/PageHelmet";
import ProductViewsDetails from "../../components/admin/ProductViewDetails";

const ProductViewsPage = () => {
  const { productId } = useParams();

  if (!productId) return <Loader />;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <PageHelmet
        title={`View Logs - Product ${productId}`}
        description={`Admin panel view logs for product ID: ${productId}`}
      />

      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Product View Logs
        </h1>

        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Viewing logs for product ID:{" "}
          <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200">
            {productId}
          </code>
        </p>

        <ProductViewsDetails productId={productId} />
      </div>
    </div>
  );
};

export default ProductViewsPage;
