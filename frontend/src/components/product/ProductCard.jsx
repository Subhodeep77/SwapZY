const ProductCard = ({ product }) => {
  return (
    <article
      className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition"
      itemScope
      itemType="https://schema.org/Product"
    >
      <img
        src={product.images?.[0]?.thumbnail || "/fallback.jpg"}
        alt={product.title}
        className="w-full h-48 object-cover"
        itemProp="image"
      />
      <div className="p-3">
        <h3 className="text-lg font-semibold" itemProp="name">
          {product.title}
        </h3>

        <p className="text-sm text-gray-500">
          <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
            ₹<span itemProp="price">{product.price}</span> •{" "}
            <span itemProp="itemCondition">{product.condition}</span>
          </span>
        </p>

        <p className="text-sm text-gray-400" itemProp="brand">
          {product.college || product.city}, {product.state}
        </p>

        <p className="text-sm text-blue-500 font-medium">
          Status: <span>{product.status}</span>
        </p>

      </div>
    </article>
  );
};

export default ProductCard;
