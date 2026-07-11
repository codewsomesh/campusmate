import { FaSearch } from "react-icons/fa";

const popularSearches = [
  "Books",
  "Laptop",
  "Clothes",
  "Ride Share",
  "Tickets",
  "Calculator",
];

export default function SearchBar() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Find Anything on Campus
        </h2>

        <p className="text-gray-500 text-center mt-3">
          Search for books, electronics, services, ride shares and much more.
        </p>

        <div className="flex mt-8 shadow-lg rounded-xl overflow-hidden">
          <input
            type="text"
            placeholder="Search for books, laptops, tutors..."
            className="flex-1 px-5 py-4 outline-none text-gray-700"
          />

          <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-8">
            <FaSearch />
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {popularSearches.map((item) => (
            <button
              key={item}
              className="bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-all duration-300 px-4 py-2 rounded-full font-medium"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
