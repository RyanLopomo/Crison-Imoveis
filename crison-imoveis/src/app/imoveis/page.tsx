import { Header } from "@/components/header";
import { PropertyCard } from "@/components/PropertyCard";
import { getProperties } from "@/lib/api";

export default async function ImoveisPage() {
  const properties = await getProperties();

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <h1 className="mb-10 text-4xl font-serif md:text-6xl">
          Imóveis disponíveis
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
}
