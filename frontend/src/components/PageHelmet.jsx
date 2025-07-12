// src/components/PageHelmet.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

const PageHelmet = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | SwapZY` : "SwapZY"}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
};

export default PageHelmet;
