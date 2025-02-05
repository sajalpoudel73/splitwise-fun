import React from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Item {
  id: string;
  name: string;
  units: number;
  unitPrice: number;
  consumers: string[];
}

interface BillSummaryProps {
  items: Item[];
  people: string[];
  payer: string;
  onPayerChange: (name: string) => void;
  onPaidAmountChange: (amount: number) => void;
}

const BillSummary = ({
  items,
  people,
  payer,
  onPayerChange,
  onPaidAmountChange,
}: BillSummaryProps) => {
  const [paidAmount, setPaidAmount] = React.useState<number>(0);

  const totalBill = items.reduce(
    (sum, item) => sum + item.units * item.unitPrice,
    0
  );

  const calculateSplits = () => {
    const splits: Record<string, number> = {};
    
    items.forEach((item) => {
      const itemTotal = item.units * item.unitPrice;
      const perPerson = itemTotal / (item.consumers.length || 1);
      
      item.consumers.forEach((person) => {
        splits[person] = (splits[person] || 0) + perPerson;
      });
    });

    if (paidAmount < totalBill) {
      const discountRatio = paidAmount / totalBill;
      Object.keys(splits).forEach((person) => {
        splits[person] *= discountRatio;
      });
    }

    return splits;
  };

  const splits = calculateSplits();

  const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setPaidAmount(amount);
    onPaidAmountChange(amount);
  };

  return (
    <Card className="p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-bill-500">Bill Summary</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Paid by</label>
          <Select value={payer} onValueChange={onPayerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select payer" />
            </SelectTrigger>
            <SelectContent>
              {people.map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount Paid</label>
          <input
            type="number"
            value={paidAmount}
            onChange={handlePaidAmountChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bill-300"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-lg font-medium">
          Total Bill: ${totalBill.toFixed(2)}
        </div>
        {paidAmount < totalBill && paidAmount > 0 && (
          <div className="text-green-600">
            Discount: ${(totalBill - paidAmount).toFixed(2)}
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-bill-100">
            <tr>
              <th className="px-4 py-2 text-left">Person</th>
              <th className="px-4 py-2 text-right">Amount to Pay</th>
              {paidAmount < totalBill && paidAmount > 0 && (
                <th className="px-4 py-2 text-right">After Discount</th>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.entries(splits).map(([person, amount]) => (
              <tr key={person} className="border-t">
                <td className="px-4 py-2">{person}</td>
                <td className="px-4 py-2 text-right">
                  ${(amount * (totalBill / paidAmount)).toFixed(2)}
                </td>
                {paidAmount < totalBill && paidAmount > 0 && (
                  <td className="px-4 py-2 text-right">${amount.toFixed(2)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default BillSummary;