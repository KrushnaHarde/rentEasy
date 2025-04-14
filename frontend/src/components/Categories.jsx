//categories
// src/pages/Categories.jsx
import React, { useState } from 'react';
import { Search, ChevronDown, ArrowRight, SlidersHorizontal } from 'lucide-react';

const categories = [
  {
    id: 1,
    title: 'Electronics',
    description: 'Smartphones, Laptops, Gaming',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 2,
    title: 'Fashion',
    description: 'Clothing, Shoes, Accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 3,
    title: 'Books',
    description: 'Fiction, Non-fiction, Academic',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 4,
    title: 'Bikes',
    description: 'Scooters, Motorcycles, E-bikes',
    image: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 5,
    title: 'Stationery',
    description: 'Notebooks, Pens, Art Supplies',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 6,
    title: 'Jewelry',
    description: 'Rings, Necklaces, Watches',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=500',
  },
];

function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const filteredCategories = categories.filter((category) =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Blurs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#8968CD]/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#24aae2]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0e8c7f]/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-white to-[#8968CD]/5 py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 w-32 h-32 bg-[#096192]/10 rounded-br-full" />
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#1399c6]/10 rounded-bl-full" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 className="text-5xl font-bold text-gray-900 text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#096192] to-[#8968CD] leading-tight">
            Explore by Categories
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-4 pl-12 rounded-xl border border-[#8968CD]/20 focus:outline-none focus:ring-2 focus:ring-[#8968CD]/30 shadow-lg shadow-[#8968CD]/5 transition-all duration-200"
            />
            <Search className="absolute left-4 top-4 text-[#8968CD]" size={20} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 bg-gradient-to-r from-[#096192]/5 to-[#24aae2]/5 p-4 rounded-xl">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md border border-[#1399c6]/20 hover:bg-[#1399c6]/5 transition-all duration-200">
              <SlidersHorizontal size={18} className="text-[#1399c6]" />
              <span className="text-sm font-medium text-[#096192]">Filters</span>
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white px-4 py-2 pr-8 rounded-lg shadow-md border border-[#1399c6]/20 focus:outline-none focus:ring-2 focus:ring-[#1399c6]/30 transition-all duration-200"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-[#1399c6]" />
            </div>
          </div>
          <p className="text-sm text-[#096192]">
            Showing {filteredCategories.length} categories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#8968CD]/10"
            >
              <div className="relative overflow-hidden rounded-t-xl p-4">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#096192] mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <button className="flex items-center space-x-2 text-[#8968CD] font-medium group-hover:text-[#24aae2] transition-colors duration-200">
                  <span>View All</span>
                  <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Categories;
