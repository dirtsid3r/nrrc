import React, { useState, useRef } from "react"
import type { SortingPuzzle, SortingItem } from "@/types/puzzle-types"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { ChevronDown, ChevronUp } from "lucide-react"

interface DraggableItemProps {
  item: SortingItem
}

// Item type for drag and drop
const ITEM_TYPE = "sortingItem"

const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
  const itemRef = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: { id: item.id, name: item.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  
  // Apply the drag ref to our element
  dragRef(itemRef)

  return (
    <div
      ref={itemRef}
      className={`p-2 mb-2 bg-black border border-red-800/30 rounded cursor-move ${
        isDragging ? "opacity-50" : "hover:border-red-500/50"
      } transition-colors duration-200`}
      style={{ fontFamily: "'Tomorrow', sans-serif" }}
    >
      <div className="text-red-400">{item.name}</div>
    </div>
  )
}

interface CategoryBoxProps {
  category: string
  items: SortingItem[]
  onDrop: (itemId: string, category: string) => void
  isCorrect: boolean
}

const CategoryBox: React.FC<CategoryBoxProps> = ({ category, items, onDrop, isCorrect }) => {
  const boxRef = useRef<HTMLDivElement>(null)
  
  const [{ isOver }, dropRef] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string }) => onDrop(item.id, category),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })
  
  // Apply the drop ref to our element
  dropRef(boxRef)

  // Change border and text color based on correctness
  const borderColor = isCorrect 
    ? "border-green-500" 
    : isOver 
      ? "border-red-500" 
      : "border-red-900/30"
  
  const textColor = isCorrect ? "text-green-400" : "text-red-400"

  return (
    <div
      ref={boxRef}
      className={`p-4 rounded-lg border-2 ${borderColor} bg-black min-h-[200px] transition-colors duration-200`}
      style={{ fontFamily: "'Tomorrow', sans-serif" }}
    >
      <h3 className={`text-lg font-semibold mb-4 text-center ${textColor}`}>{category}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-2 bg-black border ${isCorrect ? 'border-green-800/30' : 'border-red-800/30'} rounded`}
          >
            <div className={isCorrect ? "text-green-400" : "text-red-400"}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface VisualSortingPuzzleProps {
  puzzle: SortingPuzzle
  currentAssignments: Record<string, string[]>
  onAssign: (itemId: string, category: string) => void
}

export const VisualSortingPuzzle: React.FC<VisualSortingPuzzleProps> = ({
  puzzle,
  currentAssignments,
  onAssign,
}) => {
  const [isMolecularDataExpanded, setIsMolecularDataExpanded] = useState(false)
  const [isSortingExpanded, setIsSortingExpanded] = useState(true)
  
  // Get unassigned items
  const assignedItemIds = Object.values(currentAssignments).flat()
  const unassignedItems = puzzle.items.filter(
    (item) => !assignedItemIds.includes(item.id)
  )

  // Get items for each category
  const getCategoryItems = (category: string): SortingItem[] => {
    const categoryItemIds = currentAssignments[category] || []
    return puzzle.items.filter((item) => categoryItemIds.includes(item.id))
  }

  // Check if a category is correctly sorted
  const isCategoryCorrect = (category: string): boolean => {
    const assignedItems = currentAssignments[category] || []
    const correctItems = puzzle.solution[category] || []
    
    // Must have same length and all correct items
    return assignedItems.length === correctItems.length && 
      correctItems.every(id => assignedItems.includes(id))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6" style={{ fontFamily: "'Tomorrow', sans-serif" }}>
        {/* Accordion for molecular data (unassigned items) */}
        <div className="bg-black border border-red-900/30 rounded-lg overflow-hidden">
          <button 
            className="w-full p-4 flex justify-between items-center bg-black hover:bg-red-900/10 transition-colors"
            onClick={() => setIsMolecularDataExpanded(!isMolecularDataExpanded)}
          >
            <h3 className="text-lg font-semibold text-red-400">Molecular Database</h3>
            {isMolecularDataExpanded ? 
              <ChevronUp className="h-5 w-5 text-red-400" /> : 
              <ChevronDown className="h-5 w-5 text-red-400" />
            }
          </button>
          
          {isMolecularDataExpanded && (
            <div className="p-4 border-t border-red-900/30">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {unassignedItems.map((item) => (
                  <DraggableItem key={item.id} item={item} />
                ))}
              </div>
              {unassignedItems.length === 0 && (
                <div className="text-center py-4 text-gray-500">All molecular compounds have been sorted.</div>
              )}
            </div>
          )}
        </div>

        {/* Accordion for sorting categories */}
        <div className="bg-black border border-red-900/30 rounded-lg overflow-hidden">
          <button 
            className="w-full p-4 flex justify-between items-center bg-black hover:bg-red-900/10 transition-colors"
            onClick={() => setIsSortingExpanded(!isSortingExpanded)}
          >
            <h3 className="text-lg font-semibold text-red-400">Classification Chambers</h3>
            {isSortingExpanded ? 
              <ChevronUp className="h-5 w-5 text-red-400" /> : 
              <ChevronDown className="h-5 w-5 text-red-400" />
            }
          </button>
          
          {isSortingExpanded && (
            <div className="p-4 border-t border-red-900/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {puzzle.categories.map((category) => (
                  <CategoryBox
                    key={category}
                    category={category}
                    items={getCategoryItems(category)}
                    onDrop={(itemId) => onAssign(itemId, category)}
                    isCorrect={isCategoryCorrect(category)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  )
} 