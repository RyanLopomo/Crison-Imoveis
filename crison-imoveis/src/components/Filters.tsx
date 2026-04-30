"use client";

import { useState } from "react";
import type { PropertyFilters } from "@/data/properties";

type FiltersProps = {
  onFilter: (filters: PropertyFilters) => void;
};

export function Filters({ onFilter }: FiltersProps) {
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");

  function applyFilters() {
    onFilter({ type, city, price });
  }

  return (
    <div className="mb-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-4">
      <select
        onChange={(e) => setType(e.target.value)}
        className="rounded-xl bg-black/50 p-3 outline-none"
      >
        <option value="">Tipo</option>
        <option>Casa</option>
        <option>Apartamento</option>
        <option>Terreno</option>
        <option>Fazenda</option>
      </select>

      <input
        placeholder="Cidade"
        onChange={(e) => setCity(e.target.value)}
        className="rounded-xl bg-black/50 p-3 outline-none"
      />

      <select
        onChange={(e) => setPrice(e.target.value)}
        className="rounded-xl bg-black/50 p-3 outline-none"
      >
        <option value="">Faixa de preço</option>
        <option value="300">Até 300k</option>
        <option value="600">Até 600k</option>
        <option value="1000">Até 1M</option>
      </select>

      <button
        onClick={applyFilters}
        className="rounded-xl bg-[#D6A84F] p-3 font-bold text-black"
      >
        Filtrar
      </button>
    </div>
  );
}
