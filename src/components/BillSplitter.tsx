
import React, { useEffect } from "react";
import PeopleSection from "./PeopleSection";
import ItemsSection from "./ItemsSection";
import BillSummary from "./BillSummary";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import {
  initDB,
  saveItem,
  savePerson,
  saveLatestBill,
  getLatestBill,
  clearLatestBill,
  getSuggestions,
  getItemPrice,
} from "../utils/indexedDB";

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
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        const latestBill = await getLatestBill();
        if (latestBill) {
          setPeople(latestBill.people || []);
          setItems(latestBill.items || []);
          setPayer(latestBill.payer || "");
          setPaidAmount(latestBill.paidAmount || 0);
        }
      } catch (error) {
        console.error("Failed to initialize DB:", error);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const saveBill = async () => {
      if (people.length > 0 || items.length > 0) {
        try {
          await saveLatestBill({
            people,
            items,
            payer,
            paidAmount,
            date: new Date(),
          });
        } catch (error) {
          console.error("Failed to save bill:", error);
        }
      }
    };
    saveBill();
  }, [people, items, payer, paidAmount]);

  const handleAddPerson = async (name: string) => {
    const capitalizedName = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    if (!people.includes(capitalizedName)) {
      setPeople([...people, capitalizedName]);
      await savePerson(capitalizedName);
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

  const handleAddItem = async (item: Item) => {
    const newItem = {
      ...item,
      name: item.name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    };
    setItems([...items, newItem]);
    await saveItem(newItem.name, newItem.unitPrice);
  };

  const handleEditItem = async (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'name' || field === 'unitPrice') {
            saveItem(updatedItem.name, updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleNewBill = async () => {
    try {
      await clearLatestBill();
      setPeople([]);
      setItems([]);
      setPayer("");
      setPaidAmount(0);
      toast({
        title: "New Bill Started",
        description: "All previous data has been cleared.",
      });
    } catch (error) {
      console.error("Failed to clear bill:", error);
      toast({
        title: "Error",
        description: "Failed to clear previous data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-bill-500">Bill Splitter</h1>
        <Button
          variant="destructive"
          onClick={handleNewBill}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          New Bill
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PeopleSection
          people={people}
          onAddPerson={handleAddPerson}
          onEditPerson={handleEditPerson}
          onDeletePerson={handleDeletePerson}
          getSuggestions={(query) => getSuggestions('people', query)}
        />
        
        <ItemsSection
          items={items}
          people={people}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          getSuggestions={(query) => getSuggestions('items', query)}
          getItemPrice={getItemPrice}
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
