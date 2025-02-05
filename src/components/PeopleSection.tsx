
import React from "react";
import { Card } from "@/components/ui/card";
import PersonCard from "./PersonCard";
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
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      setNewPersonName("");
      setOpen(false);
      setSuggestions([]);
    }
  };

  const handleInputChange = async (value: string) => {
    setNewPersonName(value);
    try {
      if (value.trim().length > 0) {
        const results = await getSuggestions(value);
        setSuggestions(results ?? []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-bill-500">People</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter person's name"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bill-300"
              />
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search people..."
                  value={newPersonName}
                  onValueChange={handleInputChange}
                />
                <CommandEmpty>No suggestions found.</CommandEmpty>
                <CommandGroup>
                  {(suggestions || []).map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      onSelect={() => {
                        setNewPersonName(suggestion);
                        setOpen(false);
                      }}
                    >
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
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
