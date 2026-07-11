import {
  FaBook,
  FaLaptop,
  FaTshirt,
  FaTicketAlt,
  FaCar,
  FaChalkboardTeacher,
} from "react-icons/fa";

const categories = [
  { name: "Books & Notes", icon: FaBook },
  { name: "Electronics", icon: FaLaptop },
  { name: "Fashion", icon: FaTshirt },
  { name: "Tickets", icon: FaTicketAlt },
  { name: "Ride Share", icon: FaCar },
  { name: "Services", icon: FaChalkboardTeacher },
];

export default function Categories() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800">
            Explore Categories
          </h2>

          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Find everything from textbooks and gadgets to student services, ride
            sharing, and event tickets.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-14">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.name}
                className="group cursor-pointer rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 transition group-hover:bg-blue-600">
                  <Icon className="text-4xl text-blue-600 transition group-hover:text-white" />
                </div>

                <h3 className="mt-6 text-center text-xl font-semibold text-gray-800">
                  {category.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
