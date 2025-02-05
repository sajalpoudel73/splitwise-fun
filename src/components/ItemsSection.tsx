
import React from "react";
import { Card } from "@/components/ui/card";
import ItemCard from "./ItemCard";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim()) {
      onAddItem({
        id: Date.now().toString(),
        ...newItem,
        consumers: [],
      });
      setNewItem({ name: "", units: 0, unitPrice: 0 });
      setOpen(false);
      setSuggestions([]);
    }
  };

  const handleNameChange = async (value: string) => {
    setNewItem({ ...newItem, name: value });
    if (value.trim().length > 0) {
      try {
        const results = await getSuggestions(value);
        setSuggestions(results || []);
        
        const exactMatch = results?.find(
          (s) => s.toLowerCase() === value.toLowerCase()
        );
        if (exactMatch) {
          const price = await getItemPrice(exactMatch);
          if (price !== null) {
            setNewItem((prev) => ({ ...prev, unitPrice: price }));
          }
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-bill-500">Items</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Item name"
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bill-300"
              />
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search items..."
                  value={newItem.name}
                  onValueChange={handleNameChange}
                />
                {suggestions.length === 0 ? (
                  <CommandEmpty>No suggestions found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {suggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion}
                        value={suggestion}
                        onSelect={async () => {
                          const price = await getItemPrice(suggestion);
                          setNewItem({
                            ...newItem,
                            name: suggestion,
                            unitPrice: price || 0,
                          });
                          setOpen(false);
                        }}
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </Command>
            </PopoverContent>
          </Popover>
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

      <div className="space-y-4">
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
