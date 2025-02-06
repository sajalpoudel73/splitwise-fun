import React from "react";
import { Card } from "@/components/ui/card";
import ItemCard from "./ItemCard";

interface Item {
  id: string;
  name: string;
  units: number;
  unitPrice: number;
  consumers: string[];
}

interface ItemsSectionProps {
  items: Item[];
  people: string[];
  onAddItem: (item: Item) => void;
  onEditItem: (id: string, field: string, value: any) => void;
  onDeleteItem: (id: string) => void;
  getSuggestions: (query: string) => Promise<string[]>;
  getItemPrice: (name: string) => Promise<number | null>;
}

const ItemsSection = ({
  items,
  people,
  onAddItem,
  onEditItem,
  onDeleteItem,
  getSuggestions,
  getItemPrice,
}: ItemsSectionProps) => {
  const [newItem, setNewItem] = React.useState({
    name: "",
    units: 0,
    unitPrice: 0,
  });
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim()) {
      onAddItem({
        id: Date.now().toString(),
        ...newItem,
        consumers: [],
      });
      setNewItem({ name: "", units: 0, unitPrice: 0 });
      setSuggestions([]);
    }
  };

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewItem({ ...newItem, name: value });
    
    if (value.trim().length > 0) {
      try {
        const results = await getSuggestions(value);
        setSuggestions(results || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      const exactMatch = suggestions.find(
        (s) => s.toLowerCase().startsWith(newItem.name.toLowerCase())
      );
      if (exactMatch) {
        const price = await getItemPrice(exactMatch);
        setNewItem(prev => ({
          ...prev,
          name: exactMatch,
          unitPrice: price || prev.unitPrice
        }));
        setSuggestions([]);
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-bill-500">Items</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            value={newItem.name}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            placeholder="Item name (Tab to autocomplete)"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bill-300"
          />
          <input
            type="number"
            value={newItem.units}
            onChange={(e) =>
              setNewItem({ ...newItem, units: parseFloat(e.target.value) || 0 })
            }
            placeholder="Number of units"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bill-300"
            min="0"
            step="1"
          />
          <input
            type="number"
            value={newItem.unitPrice}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                unitPrice: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="Price per unit"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bill-300"
            min="0"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-bill-400 text-white rounded-md hover:bg-bill-500 transition-colors w-full"
        >
          Add Item
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            {...item}
            people={people}
            onEdit={onEditItem}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </div>
    </Card>
  );
};

export default ItemsSection;