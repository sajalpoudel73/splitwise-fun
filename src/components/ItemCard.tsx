import React from "react";
import { Card } from "@/components/ui/card";

interface ItemCardProps {
  id: string;
  name: string;
  units: number;
  unitPrice: number;
  consumers: string[];
  onEdit: (id: string, field: string, value: string | number) => void;
  onDelete: () => void;
}

const ItemCard = ({
  id,
  name,
  units,
  unitPrice,
  consumers,
  onEdit,
  onDelete,
}: ItemCardProps) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const personName = e.dataTransfer.getData("text/plain");
    if (!consumers.includes(personName)) {
      onEdit(id, "consumers", [...consumers, personName]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeConsumer = (personName: string) => {
    onEdit(
      id,
      "consumers",
      consumers.filter((c) => c !== personName)
    );
  };

  return (
    <Card className="p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => onEdit(id, "name", e.target.value)}
          className="px-2 py-1 border rounded"
          placeholder="Item name"
        />
        <input
          type="number"
          value={units}
          onChange={(e) => onEdit(id, "units", parseFloat(e.target.value) || 0)}
          className="px-2 py-1 border rounded"
          placeholder="Units"
          min="0"
          step="1"
        />
        <input
          type="number"
          value={unitPrice}
          onChange={(e) =>
            onEdit(id, "unitPrice", parseFloat(e.target.value) || 0)
          }
          className="px-2 py-1 border rounded"
          placeholder="Price per unit"
          min="0"
          step="0.01"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="min-h-20 p-3 border-2 border-dashed rounded-lg bg-gray-50"
      >
        <div className="text-sm text-gray-500 mb-2">
          Drop people names here who consumed this item
        </div>
        <div className="flex flex-wrap gap-2">
          {consumers.map((person) => (
            <span
              key={person}
              className="px-2 py-1 bg-bill-100 text-bill-500 rounded-full text-sm flex items-center gap-1"
            >
              {person}
              <button
                onClick={() => removeConsumer(person)}
                className="ml-1 text-bill-400 hover:text-bill-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onDelete}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Delete Item
        </button>
      </div>
    </Card>
  );
};

export default ItemCard;