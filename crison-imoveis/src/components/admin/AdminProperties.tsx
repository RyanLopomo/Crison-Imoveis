"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { ImageUpload } from "./ImageUpload";

type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  city: string;
  neighborhood: string;
  imageUrl: string;
  featured: boolean;
};

const initialForm = {
  title: "",
  description: "",
  price: "",
  type: "Casa",
  category: "Médio Padrão",
  city: "",
  neighborhood: "",
  imageUrl: "",
  featured: false,
};

export function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadProperties() {
    const response = await fetch("/api/properties");
    const data = await response.json();
    setProperties(data);
  }

  useEffect(() => {
    loadProperties();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    await fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm(initialForm);
    await loadProperties();
    setLoading(false);
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!editingId) return;

    setLoading(true);

    await fetch(`/api/properties/${editingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setEditingId(null);
    setForm(initialForm);
    await loadProperties();
    setLoading(false);
  }

  function handleEdit(property: Property) {
    setEditingId(property.id);

    setForm({
      title: property.title,
      description: property.description,
      price: String(property.price),
      type: property.type,
      category: property.category,
      city: property.city,
      neighborhood: property.neighborhood,
      imageUrl: property.imageUrl,
      featured: property.featured,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Deseja excluir este imóvel?");
    if (!confirmDelete) return;

    await fetch(`/api/properties/${id}`, {
      method: "DELETE",
    });

    await loadProperties();
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-[#D6A84F]">
            CrisOn Admin
          </p>

          <h1 className="mt-3 font-serif text-4xl md:text-6xl">
            Gerenciar imóveis
          </h1>
        </div>

        <a
          href="/"
          className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/70 transition hover:border-[#D6A84F] hover:text-[#D6A84F]"
        >
          Voltar ao site
        </a>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        {/* FORM */}
        <motion.form
          onSubmit={editingId ? handleUpdate : handleCreate}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <Plus className="text-[#D6A84F]" />
            <h2 className="font-serif text-3xl">
              {editingId ? "Editar imóvel" : "Novo imóvel"}
            </h2>
          </div>

          <div className="space-y-4">
            <input
              required
              placeholder="Título do imóvel"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="admin-input"
            />

            <textarea
              required
              placeholder="Descrição"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="admin-input min-h-28 resize-none"
            />

            <input
              required
              type="number"
              placeholder="Preço"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="admin-input"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="admin-input"
              >
                <option>Casa</option>
                <option>Apartamento</option>
                <option>Terreno</option>
                <option>Fazenda</option>
              </select>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="admin-input"
              >
                <option>Minha Casa Minha Vida</option>
                <option>Médio Padrão</option>
                <option>Alto Padrão</option>
                <option>Terreno</option>
                <option>Fazenda</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Cidade"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="admin-input"
              />

              <input
                required
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
                className="admin-input"
              />
            </div>

            <ImageUpload
              onUpload={(url) => setForm({ ...form, imageUrl: url })}
            />

            {/* PREVIEW COM ANIMAÇÃO */}
            {form.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-44 rounded-2xl border border-white/10 bg-cover bg-center"
                style={{ backgroundImage: `url(${form.imageUrl})` }}
              />
            )}

            <label className="flex items-center gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              Marcar como destaque
            </label>

            {editingId && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={cancelEdit}
                className="w-full rounded-xl border border-white/20 px-5 py-3 text-white/70 transition hover:bg-white hover:text-black"
              >
                Cancelar edição
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full rounded-xl bg-[#D6A84F] px-5 py-4 font-bold text-black transition hover:bg-white"
            >
              {loading
                ? editingId
                  ? "Atualizando..."
                  : "Cadastrando..."
                : editingId
                ? "Atualizar imóvel"
                : "Cadastrar imóvel"}
            </motion.button>
          </div>
        </motion.form>

        {/* LISTA */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <h2 className="mb-6 font-serif text-3xl">Imóveis cadastrados</h2>

          <div className="space-y-4">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 md:grid-cols-[120px_1fr_auto]"
              >
                <div
                  className="h-28 rounded-xl bg-cover bg-center transition group-hover:scale-105"
                  style={{ backgroundImage: `url(${property.imageUrl})` }}
                />

                <div>
                  <p className="text-xs uppercase tracking-widest text-[#D6A84F]">
                    {property.category}
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {property.title}
                  </h3>

                  <p className="mt-2 text-sm text-white/50">
                    {property.city} - {property.neighborhood}
                  </p>

                  <p className="mt-2 font-bold text-[#D6A84F]">
                    R$ {property.price.toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(property)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white hover:text-black"
                  >
                    <Pencil size={18} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(property.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-red-500/30 text-red-400 transition hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {properties.length === 0 && (
              <p className="rounded-xl border border-white/10 p-6 text-white/50">
                Nenhum imóvel cadastrado ainda.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
