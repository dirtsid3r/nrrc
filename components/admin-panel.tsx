import { useState, useEffect } from "react"
import { PuzzleData, PuzzleType, SortingPuzzle, isSortingPuzzle } from "@/types/puzzle-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export function AdminPanel() {
  const [puzzles, setPuzzles] = useState<PuzzleType[]>([])
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newItem, setNewItem] = useState<{ id: string; name: string }>({ id: "", name: "" })
  const [newCategory, setNewCategory] = useState("")

  useEffect(() => {
    fetchPuzzles()
  }, [])

  const fetchPuzzles = async () => {
    try {
      const response = await fetch("/api/puzzles")
      const data = await response.json()
      setPuzzles(data)
    } catch (error) {
      toast.error("Failed to fetch puzzles")
    }
  }

  const handlePuzzleSelect = (puzzle: PuzzleType) => {
    setSelectedPuzzle(puzzle)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedPuzzle) return

    try {
      // Update the puzzle in the local state
      const updatedPuzzles = puzzles.map(puzzle => 
        puzzle.id === selectedPuzzle.id ? selectedPuzzle : puzzle
      )
      
      // Save all puzzles to the server
      const response = await fetch('/api/puzzles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPuzzles)
      })

      if (!response.ok) throw new Error("Failed to save puzzles")

      toast.success("Puzzle updated successfully")
      setIsEditing(false)
      setPuzzles(updatedPuzzles)
    } catch (error) {
      console.error('Error saving puzzle:', error)
      toast.error("Failed to update puzzle")
    }
  }

  const handleAddItem = () => {
    if (!selectedPuzzle || !isSortingPuzzle(selectedPuzzle)) return
    if (!newItem.id || !newItem.name) {
      toast.error("Please fill in both ID and name for the new item")
      return
    }

    const updatedPuzzle = {
      ...selectedPuzzle,
      items: [...selectedPuzzle.items, { ...newItem }],
    }
    setSelectedPuzzle(updatedPuzzle)
    setNewItem({ id: "", name: "" })
  }

  const handleRemoveItem = (itemId: string) => {
    if (!selectedPuzzle || !isSortingPuzzle(selectedPuzzle)) return

    const updatedPuzzle = {
      ...selectedPuzzle,
      items: selectedPuzzle.items.filter((item) => item.id !== itemId),
      solution: Object.fromEntries(
        Object.entries(selectedPuzzle.solution).map(([category, items]) => [
          category,
          items.filter((id) => id !== itemId),
        ])
      ),
    }
    setSelectedPuzzle(updatedPuzzle)
  }

  const handleAddCategory = () => {
    if (!selectedPuzzle || !isSortingPuzzle(selectedPuzzle) || !newCategory) return

    const updatedPuzzle = {
      ...selectedPuzzle,
      categories: [...selectedPuzzle.categories, newCategory],
      solution: {
        ...selectedPuzzle.solution,
        [newCategory]: [],
      },
    }
    setSelectedPuzzle(updatedPuzzle)
    setNewCategory("")
  }

  const handleRemoveCategory = (category: string) => {
    if (!selectedPuzzle || !isSortingPuzzle(selectedPuzzle)) return

    const { [category]: removedCategory, ...remainingSolution } = selectedPuzzle.solution
    const updatedPuzzle = {
      ...selectedPuzzle,
      categories: selectedPuzzle.categories.filter((cat) => cat !== category),
      solution: remainingSolution,
    }
    setSelectedPuzzle(updatedPuzzle)
  }

  const handleToggleItemInSolution = (itemId: string, category: string) => {
    if (!selectedPuzzle || !isSortingPuzzle(selectedPuzzle)) return

    const currentItems = selectedPuzzle.solution[category] || []
    const updatedItems = currentItems.includes(itemId)
      ? currentItems.filter((id) => id !== itemId)
      : [...currentItems, itemId]

    const updatedPuzzle = {
      ...selectedPuzzle,
      solution: {
        ...selectedPuzzle.solution,
        [category]: updatedItems,
      },
    }
    setSelectedPuzzle(updatedPuzzle)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel - Puzzle Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="puzzles">
            <TabsList>
              <TabsTrigger value="puzzles">Puzzles</TabsTrigger>
            </TabsList>
            <TabsContent value="puzzles">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Puzzle List</h3>
                  <div className="space-y-2">
                    {puzzles.map((puzzle) => (
                      <Button
                        key={puzzle.id}
                        variant={selectedPuzzle?.id === puzzle.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handlePuzzleSelect(puzzle)}
                      >
                        {puzzle.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedPuzzle && (
                    <>
                      <h3 className="text-lg font-semibold">Edit Puzzle</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={selectedPuzzle.name}
                            onChange={(e) =>
                              setSelectedPuzzle({ ...selectedPuzzle, name: e.target.value })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Initial Message</label>
                          <Textarea
                            value={selectedPuzzle.initialMessage}
                            onChange={(e) =>
                              setSelectedPuzzle({
                                ...selectedPuzzle,
                                initialMessage: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>

                        {isSortingPuzzle(selectedPuzzle) ? (
                          <>
                            <div className="border-t pt-4">
                              <h4 className="text-md font-semibold mb-2">Items</h4>
                              <div className="space-y-2">
                                {(selectedPuzzle as SortingPuzzle).items.map((item) => (
                                  <div key={item.id} className="flex items-center space-x-2">
                                    <Input
                                      value={item.id}
                                      onChange={(e) => {
                                        const updatedItems = (selectedPuzzle as SortingPuzzle).items.map(
                                          (i) => (i.id === item.id ? { ...i, id: e.target.value } : i)
                                        )
                                        setSelectedPuzzle({
                                          ...selectedPuzzle,
                                          items: updatedItems,
                                        } as SortingPuzzle)
                                      }}
                                      disabled={!isEditing}
                                      placeholder="ID"
                                      className="w-1/4"
                                    />
                                    <Input
                                      value={item.name}
                                      onChange={(e) => {
                                        const updatedItems = (selectedPuzzle as SortingPuzzle).items.map(
                                          (i) => (i.id === item.id ? { ...i, name: e.target.value } : i)
                                        )
                                        setSelectedPuzzle({
                                          ...selectedPuzzle,
                                          items: updatedItems,
                                        } as SortingPuzzle)
                                      }}
                                      disabled={!isEditing}
                                      placeholder="Name"
                                      className="flex-1"
                                    />
                                    {isEditing && (
                                      <Button
                                        onClick={() => handleRemoveItem(item.id)}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {isEditing && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <Input
                                    value={newItem.id}
                                    onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                                    placeholder="New Item ID"
                                    className="w-1/4"
                                  />
                                  <Input
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="New Item Name"
                                    className="flex-1"
                                  />
                                  <Button onClick={handleAddItem} variant="outline" size="sm">
                                    Add Item
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="text-md font-semibold mb-2">Categories</h4>
                              <div className="space-y-2">
                                {(selectedPuzzle as SortingPuzzle).categories.map((category) => (
                                  <div key={category} className="flex items-center space-x-2">
                                    <Input
                                      value={category}
                                      onChange={(e) => {
                                        const updatedCategories = (
                                          selectedPuzzle as SortingPuzzle
                                        ).categories.map((c) =>
                                          c === category ? e.target.value : c
                                        )
                                        setSelectedPuzzle({
                                          ...selectedPuzzle,
                                          categories: updatedCategories,
                                        } as SortingPuzzle)
                                      }}
                                      disabled={!isEditing}
                                    />
                                    {isEditing && (
                                      <Button
                                        onClick={() => handleRemoveCategory(category)}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {isEditing && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <Input
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="New Category Name"
                                    className="flex-1"
                                  />
                                  <Button onClick={handleAddCategory} variant="outline" size="sm">
                                    Add Category
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="text-md font-semibold mb-2">Solution</h4>
                              <div className="space-y-4">
                                {(selectedPuzzle as SortingPuzzle).categories.map((category) => (
                                  <div key={category}>
                                    <h5 className="font-medium mb-2">{category}</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {(selectedPuzzle as SortingPuzzle).items.map((item) => (
                                        <Button
                                          key={item.id}
                                          variant={
                                            (selectedPuzzle as SortingPuzzle).solution[category]?.includes(
                                              item.id
                                            )
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() => handleToggleItemInSolution(item.id, category)}
                                          disabled={!isEditing}
                                        >
                                          {item.id}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="text-sm font-medium">Passphrase</label>
                              <Input
                                value={selectedPuzzle.passphrase}
                                onChange={(e) =>
                                  setSelectedPuzzle({
                                    ...selectedPuzzle,
                                    passphrase: e.target.value,
                                  })
                                }
                                disabled={!isEditing}
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="text-sm font-medium">Hints</label>
                          {selectedPuzzle.hints.map((hint, index) => (
                            <Input
                              key={index}
                              value={hint}
                              onChange={(e) => {
                                const newHints = [...selectedPuzzle.hints]
                                newHints[index] = e.target.value
                                setSelectedPuzzle({
                                  ...selectedPuzzle,
                                  hints: newHints,
                                })
                              }}
                              disabled={!isEditing}
                              className="mt-2"
                            />
                          ))}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Success Message</label>
                          <Textarea
                            value={selectedPuzzle.successMessage}
                            onChange={(e) =>
                              setSelectedPuzzle({
                                ...selectedPuzzle,
                                successMessage: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setIsEditing(!isEditing)}
                            variant={isEditing ? "outline" : "default"}
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </Button>
                          {isEditing && (
                            <Button onClick={handleSave} variant="default">
                              Save Changes
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 