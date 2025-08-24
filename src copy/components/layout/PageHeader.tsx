import React from "react";

const PageHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      <p className="text-md text-gray-600 dark:text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
};

export default PageHeader;
