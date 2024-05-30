// comment out the following line and use the real data in MongoDB
// import properties from "@/properties.json";
import PropertySearchForm from "@/components/PropertySearchForm";
import Properties from "@/components/Properties"; // 5-27-2024

const PropertiesPage = async () => {
  //5-27-2024 - Will remove the following lines
  //const properties = await fetchProperties();
  // Sort properties by date
  //properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 5-24-2024
  return (
    <>
      <section className="bg-blue-700 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8">
          <PropertySearchForm />
        </div>
      </section>
      <Properties />
    </>
  );
};

export default PropertiesPage;
