
import React from "react";
import { Card } from "@/components/ui/card";
import PersonCard from "./PersonCard";

interface PeopleSectionProps {
  people: string[];
  onAddPerson: (name: string) => void;
  onEditPerson: (index: number, newName: string) => void;
  onDeletePerson: (index: number) => void;
  getSuggestions: (query: string) => Promise<string[]>;
}

const PeopleSection = ({
  people,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  getSuggestions,
}: PeopleSectionProps) => {
  const [newPersonName, setNewPersonName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      setNewPersonName("");
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPersonName(value);
    if (value.trim().length > 0) {
      try {
        const results = await getSuggestions(value);
        const exactMatch = results?.find(
          (s) => s.toLowerCase().startsWith(value.toLowerCase())
        );
        if (exactMatch) {
          setNewPersonName(exactMatch);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-bill-500">People</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPersonName}
            onChange={handleInputChange}
            placeholder="Enter person's name"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bill-300"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-bill-400 text-white rounded-md hover:bg-bill-500 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {people.map((person, index) => (
          <PersonCard
            key={index}
            name={person}
            onEdit={(newName) => onEditPerson(index, newName)}
            onDelete={() => onDeletePerson(index)}
          />
        ))}
      </div>
    </Card>
  );
};

export default PeopleSection;
