import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { BloodStockDetail } from "../types";

interface BloodStockItem {
  groupe_sanguin: string;
  quantite_poches: number;
  seuil_alerte_min: number;
  max_stock?: number;
}

const BloodStockCard: React.FC<{
  stock: BloodStockItem;
  onUpdate: (group: string, quantity: number) => void;
}> = ({ stock, onUpdate }) => {
  const maxStock = stock.max_stock || 50;
  const percentage = (stock.quantite_poches / maxStock) * 100;

  let status: "Critique" | "Faible" | "Suffisant" = "Suffisant";
  let statusColor = "green";
  if (stock.quantite_poches <= stock.seuil_alerte_min) {
    status = "Critique";
    statusColor = "red";
  } else if (percentage < 40) {
    status = "Faible";
    statusColor = "yellow";
  }

  const statusClasses = {
    Critique: {
      badge: "bg-red-100 text-primary dark:bg-primary/20 dark:text-primary",
      ring: "border-2 border-primary/50 ring-2 ring-primary/10",
      progress: "bg-primary",
      button: "bg-primary text-white shadow-md shadow-primary/20",
      icon: "warning",
    },
    Faible: {
      badge:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      ring: "",
      progress: "bg-yellow-500",
      button:
        "bg-[#f4f0f0] dark:bg-[#3d2a2a] text-[#181111] dark:text-white hover:bg-primary hover:text-white",
      icon: "",
    },
    Suffisant: {
      badge:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      ring: "",
      progress: "bg-green-500",
      button:
        "bg-[#f4f0f0] dark:bg-[#3d2a2a] text-[#181111] dark:text-white hover:bg-primary hover:text-white",
      icon: "",
    },
  };
  const currentStatusStyle = statusClasses[status];

  return (
    <div
      className={`bg-white dark:bg-[#2a1a1a] rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors ${currentStatusStyle.ring}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-3xl font-black text-primary">
            {stock.groupe_sanguin}
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${currentStatusStyle.badge}`}
        >
          {currentStatusStyle.icon && (
            <span className="material-symbols-outlined text-[12px]">
              {currentStatusStyle.icon}
            </span>
          )}
          {status}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-bold ${status === "Critique" ? "text-primary" : ""}`}
          >
            {stock.quantite_poches}
          </span>
          <span className="text-[#886364] dark:text-white/40 font-medium">
            Poches
          </span>
        </div>
        <div className="w-full h-2 bg-[#f4f0f0] dark:bg-[#3d2a2a] rounded-full mt-2">
          <div
            className={`h-full rounded-full ${currentStatusStyle.progress}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-2">
        <p className="text-xs text-[#886364] dark:text-white/40 italic flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">schedule</span>{" "}
          Mis à jour à l'instant
        </p>
        <button
          onClick={() => onUpdate(stock.groupe_sanguin, stock.quantite_poches)}
          className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${currentStatusStyle.button}`}
        >
          Mettre à jour
        </button>
      </div>
    </div>
  );
};

interface UpdateModalProps {
  isOpen: boolean;
  group?: string;
  currentQuantity?: number;
  onClose: () => void;
  onSubmit: (group: string, quantity: number) => Promise<void>;
  isLoading?: boolean;
}

const UpdateStockModal: React.FC<UpdateModalProps> = ({
  isOpen,
  group,
  currentQuantity = 0,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [quantity, setQuantity] = useState(currentQuantity);

  useEffect(() => {
    setQuantity(currentQuantity);
  }, [currentQuantity, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(group || "", quantity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a0d0d] rounded-xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Mettre à jour le stock - {group}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de poches
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Mise à jour..." : "Confirmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BloodStock: React.FC = () => {
  const { user } = useAuth();
  const [stock, setStock] = useState<BloodStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>();
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      if (!user?.centre?.id_centre) return;
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(
          `/centres/${user.centre.id_centre}/stock`,
        );
        if (response.data.success && response.data.stock) {
          setStock(response.data.stock);
        }
      } catch (err: any) {
        console.error("Error fetching blood stock:", err);
        setError("Erreur lors de la récupération du stock");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [user]);

  const handleUpdateClick = (group: string, quantity: number) => {
    setSelectedGroup(group);
    setSelectedQuantity(quantity);
    setModalOpen(true);
  };

  const handleUpdateSubmit = async (group: string, quantity: number) => {
    if (!user?.centre?.id_centre) return;

    try {
      setUpdating(true);
      setError(null);
      const response = await api.put(
        `/centres/${user.centre.id_centre}/stock`,
        {
          groupe_sanguin: group,
          quantite_poches: quantity,
        },
      );

      if (response.data.success) {
        setStock((prevState) =>
          prevState.map((item) =>
            item.groupe_sanguin === group
              ? { ...item, quantite_poches: quantity }
              : item,
          ),
        );
      } else {
        setError(response.data.message || "Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      console.error("Error updating stock:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la mise à jour du stock",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="-m-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[#181111] dark:text-white text-4xl font-black leading-tight tracking-tight">
              Inventaire Central
            </h1>
            <p className="text-[#886364] dark:text-white/60 text-lg">
              {user?.centre?.nom || "Centre"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">
            Chargement de l'inventaire...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stock.map((item) => (
              <BloodStockCard
                key={item.groupe_sanguin}
                stock={item}
                onUpdate={handleUpdateClick}
              />
            ))}
          </div>
        )}
      </div>

      <UpdateStockModal
        isOpen={modalOpen}
        group={selectedGroup}
        currentQuantity={selectedQuantity}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdateSubmit}
        isLoading={updating}
      />
    </div>
  );
};

export default BloodStock;
