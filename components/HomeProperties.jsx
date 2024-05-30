// Stopped the following and use the real data in MongoDB
// import properties from "@/properties.json";
import PropertyCard from "./PropertyCard";
import Link from "next/link";
import { fetchProperties } from "../utils/requests";

const HomeProperties = async () => {
  // 5-28-2024 - Change properties to data
  // const properties = await fetchProperties();
  const data = await fetchProperties();

  // 5-28-2024 - Add data infront of proerties here
  const recentProperties = data.properties
    .sort(() => Math.random() - Math.random())
    .slice(0, 3);

  return (
    <>
      {" "}
      <section className="px-4 py-6">
        <div className="container-xl lg:container m-auto">
          <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
            Recent Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProperties === 0 ? (
              <p>No Properties Available</p>
            ) : (
              recentProperties.map((properties) => (
                <PropertyCard key={properties._id} property={properties} />
              ))
            )}
          </div>
        </div>
      </section>
      <section>
        <Link
          href="properties.html"
          className="block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700"
        >
          View All Properties
        </Link>
      </section>
    </>
  );
};

export default HomeProperties;
