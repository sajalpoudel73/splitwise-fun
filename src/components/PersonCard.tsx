import React from "react";
import { Card } from "@/components/ui/card";

interface PersonCardProps {
  name: string;
  onEdit: (newName: string) => void;
  onDelete: () => void;
  isDragging?: boolean;
}

const PersonCard = ({ name, onEdit, onDelete, isDragging }: PersonCardProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(editedName);
    setIsEditing(false);
  };

  return (
    <Card
      className={`p-3 mb-2 cursor-move ${
        isDragging ? "opacity-50" : ""
      } hover:shadow-md transition-shadow`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", name);
      }}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="flex-1 px-2 py-1 border rounded"
            autoFocus
          />
          <button
            type="submit"
            className="px-2 py-1 text-sm bg-bill-300 text-white rounded hover:bg-bill-400"
          >
            Save
          </button>
        </form>
      ) : (
        <div className="flex justify-between items-center">
          <span className="flex-1">{name}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-bill-400 hover:text-bill-500"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PersonCard;