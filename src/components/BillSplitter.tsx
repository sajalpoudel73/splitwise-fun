import React from "react";
import PeopleSection from "./PeopleSection";
import ItemsSection from "./ItemsSection";
import BillSummary from "./BillSummary";

interface Item {
  id: string;
  name: string;
  units: number;
  unitPrice: number;
  consumers: string[];
}

const BillSplitter = () => {
  const [people, setPeople] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);
  const [payer, setPayer] = React.useState<string>("");
  const [paidAmount, setPaidAmount] = React.useState<number>(0);

  const handleAddPerson = (name: string) => {
    if (!people.includes(name)) {
      setPeople([...people, name]);
    }
  };

  const handleEditPerson = (index: number, newName: string) => {
    const newPeople = [...people];
    newPeople[index] = newName;
    setPeople(newPeople);

    // Update consumers in items
    setItems(
      items.map((item) => ({
        ...item,
        consumers: item.consumers.map((consumer) =>
          consumer === people[index] ? newName : consumer
        ),
      }))
    );
  };

  const handleDeletePerson = (index: number) => {
    const personName = people[index];
    setPeople(people.filter((_, i) => i !== index));
    
    // Remove person from items' consumers
    setItems(
      items.map((item) => ({
        ...item,
        consumers: item.consumers.filter((consumer) => consumer !== personName),
      }))
    );
  };

  const handleAddItem = (item: Item) => {
    setItems([...items, item]);
  };

  const handleEditItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-bill-500">
        Bill Splitter
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PeopleSection
          people={people}
          onAddPerson={handleAddPerson}
          onEditPerson={handleEditPerson}
          onDeletePerson={handleDeletePerson}
        />
        
        <ItemsSection
          items={items}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />
      </div>

      <BillSummary
        items={items}
        people={people}
        payer={payer}
        onPayerChange={setPayer}
        onPaidAmountChange={setPaidAmount}
      />
    </div>
  );
};

export default BillSplitter;