import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import PageHelmet from "../../components/PageHelmet";
import ProductViewDetails from "../../components/admin/ProductViewDetails";

const ProductViewsPage = () => {
  const { productId } = useParams();

  if (!productId) return <Loader />;

  return (
    <div className="p-6">
      <PageHelmet
        title={`View Logs - Product ${productId}`}
        description={`Admin panel view logs for product ID: ${productId}`}
      />

      <h1 className="text-2xl font-semibold mb-4">Product View Logs</h1>
      <p className="mb-4 text-gray-600">
        Viewing logs for product ID: <code>{productId}</code>
      </p>

      <ProductViewDetails productId={productId} />
    </div>
  );
};

export default ProductViewsPage;
