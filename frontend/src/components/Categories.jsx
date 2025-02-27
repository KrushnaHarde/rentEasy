import React from "react";
import { useParams } from "react-router-dom";
import clothingImg from "../assets/category4.jpg";
import fashionAccessoriesImg from "../assets/category1.jpg";
import booksImg from "../assets/category2.jpg";
import electronicsImg from "../assets/category5.jpg";
import footwearImg from "../assets/category7.jpg";
import furnitureImg from "../assets/category8.jpg";

const categoryData = {
  clothing: { 
    title: "Clothing", 
    description: "Designer outfits available for rent.", 
    image: clothingImg 
  },
  "fashion-accessories": { 
    title: "Fashion Accessories", 
    description: "Trendy accessories for all occasions.", 
    image: fashionAccessoriesImg 
  },
  books: { 
    title: "Books", 
    description: "Find rare books and academic materials.", 
    image: booksImg 
  },
  electronics: { 
    title: "Electronics", 
    description: "Get the latest gadgets on rent.", 
    image: electronicsImg 
  },
  footwear: { 
    title: "Footwear", 
    description: "Stylish footwear for every season.", 
    image: footwearImg 
  },
  furniture: { 
    title: "Furniture", 
    description: "Rent quality furniture easily.", 
    image: furnitureImg 
  }
};

function CategoryPage() {
  const { categoryName } = useParams();
  const category = categoryData[categoryName];

  if (!category) {
    return <h2 className="text-white text-center mt-10">Category not found</h2>;
  }

  return (
    <div className="bg-[#0B0B0B] min-h-screen text-white flex flex-col items-center pt-20 px-6 w-full">
      <h2 className="text-4xl font-bold mb-6">{category.title}</h2>
      <img 
        src={category.image} 
        alt={category.title} 
        className="w-1/2 h-64 object-cover rounded-lg" 
      />
      <p className="text-lg mt-4 max-w-2xl text-center">{category.description}</p>
    </div>
  );
}

export default CategoryPage;
