import React from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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

  const copyToClipboard = async () => {
    // Create a temporary div to hold our content
    const tempDiv = document.createElement('div');
    
    // Add the total and payment information
    let contentHTML = `<div style="margin-bottom: 16px;">`;
    contentHTML += `<p style="margin: 4px 0;">Today's Total: Rs. ${totalBill.toFixed(2)}</p>`;
    contentHTML += `<p style="margin: 4px 0;">Payment to: ${payer || 'Not specified'}</p>`;
    contentHTML += '</div>';
    
    // Create the table HTML
    contentHTML += '<table style="border-collapse: collapse; width: 100%;">';
    
    // Add header
    contentHTML += '<thead><tr style="background-color: #f3f4f6;">';
    contentHTML += '<th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Person</th>';
    if (paidAmount < totalBill && paidAmount > 0) {
      contentHTML += '<th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Original Amount</th>';
      contentHTML += '<th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Discounted Amount</th>';
    } else {
      contentHTML += '<th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Amount</th>';
    }
    contentHTML += '</tr></thead><tbody>';

    // Add rows
    Object.entries(splits).forEach(([person, amount]) => {
      contentHTML += '<tr>';
      contentHTML += `<td style="border: 1px solid #e5e7eb; padding: 8px;">${person}</td>`;
      if (paidAmount < totalBill && paidAmount > 0) {
        contentHTML += `<td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">$${(amount * (totalBill / paidAmount)).toFixed(2)}</td>`;
        contentHTML += `<td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">$${amount.toFixed(2)}</td>`;
      } else {
        contentHTML += `<td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">$${amount.toFixed(2)}</td>`;
      }
      contentHTML += '</tr>';
    });

    contentHTML += '</tbody></table>';
    
    tempDiv.innerHTML = contentHTML;
    
    try {
      // Create a Blob containing the HTML
      const blob = new Blob([tempDiv.outerHTML], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      
      toast({
        title: "Copied to clipboard",
        description: "The bill summary table has been copied and can be pasted as a formatted table.",
      });
    } catch (err) {
      // Fallback to plain text if HTML copying fails
      const plainText = `Today's Total: Rs. ${totalBill.toFixed(2)}\n\nPayment to: ${payer || 'Not specified'}\n\n` +
        Array.from(tempDiv.querySelectorAll('tr'))
          .map(row => Array.from(row.querySelectorAll('th, td'))
            .map(cell => cell.textContent)
            .join('\t'))
          .join('\n');
      
      await navigator.clipboard.writeText(plainText);
      
      toast({
        title: "Copied as plain text",
        description: "The bill summary has been copied as plain text due to browser limitations.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-bill-500">Bill Summary</h2>
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Summary
        </Button>
      </div>

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