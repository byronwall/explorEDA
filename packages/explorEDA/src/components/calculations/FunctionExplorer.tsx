import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// This would come from your function registry
interface FunctionDoc {
  name: string;
  category: string;
  description: string;
  syntax: string;
  examples: string[];
  parameters: {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }[];
  returnType: string;
  notes?: string[];
}

// Mock data for demonstration
const FUNCTION_CATEGORIES = [
  "math",
  "statistics",
  "string",
  "date",
  "array",
  "conversion",
  "advanced",
];

const MOCK_FUNCTIONS: FunctionDoc[] = [
  {
    name: "sum",
    category: "math",
    description: "Calculates the sum of a list of numbers",
    syntax: "sum(values)",
    examples: ["sum([1, 2, 3, 4]) // Returns 10"],
    parameters: [
      {
        name: "values",
        type: "number[]",
        description: "Array of numbers to sum",
      },
    ],
    returnType: "number",
  },
  {
    name: "mean",
    category: "statistics",
    description: "Calculates the arithmetic mean of a list of numbers",
    syntax: "mean(values)",
    examples: ["mean([1, 2, 3, 4]) // Returns 2.5"],
    parameters: [
      {
        name: "values",
        type: "number[]",
        description: "Array of numbers",
      },
    ],
    returnType: "number",
  },
  {
    name: "year",
    category: "date",
    description: "Extracts the year from a date",
    syntax: "year(date)",
    examples: ["year('2023-01-15') // Returns 2023"],
    parameters: [
      {
        name: "date",
        type: "Date | string",
        description: "Date to extract year from",
      },
    ],
    returnType: "number",
  },
  {
    name: "concat",
    category: "string",
    description: "Concatenates two or more strings",
    syntax: "concat(str1, str2, ...)",
    examples: ["concat('Hello', ' ', 'World') // Returns 'Hello World'"],
    parameters: [
      {
        name: "str1",
        type: "string",
        description: "First string",
      },
      {
        name: "str2",
        type: "string",
        description: "Second string",
      },
      {
        name: "...",
        type: "string",
        description: "Additional strings",
        optional: true,
      },
    ],
    returnType: "string",
  },
  {
    name: "pca",
    category: "advanced",
    description: "Performs Principal Component Analysis on a dataset",
    syntax: "pca(data, components)",
    examples: ["pca(dataset, 2) // Returns first 2 principal components"],
    parameters: [
      {
        name: "data",
        type: "number[][]",
        description: "Matrix of data points",
      },
      {
        name: "components",
        type: "number",
        description: "Number of components to return",
        optional: true,
      },
    ],
    returnType: "number[][]",
    notes: [
      "Data should be normalized before using PCA",
      "Returns the projection of the data onto the principal components",
    ],
  },
];

interface FunctionExplorerProps {
  onSelectFunction?: (functionName: string) => void;
}

export function FunctionExplorer({ onSelectFunction }: FunctionExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFunction, setSelectedFunction] = useState<FunctionDoc | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filter functions based on search query and selected category
  const filteredFunctions = MOCK_FUNCTIONS.filter((func) => {
    const matchesSearch =
      searchQuery === "" ||
      func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      func.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || func.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleFunctionClick = (func: FunctionDoc) => {
    setSelectedFunction(func);
    setIsDetailDialogOpen(true);
  };

  const handleInsertFunction = () => {
    if (selectedFunction && onSelectFunction) {
      onSelectFunction(selectedFunction.name);
      setIsDetailDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search functions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedCategory}
        onValueChange={setSelectedCategory}
      >
        <TabsList className="w-full flex overflow-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {FUNCTION_CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {filteredFunctions.map((func) => (
                <Card
                  key={func.name}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleFunctionClick(func)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-mono">
                        {func.name}
                      </CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {func.category}
                      </Badge>
                    </div>
                    <CardDescription>{func.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      {func.syntax}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredFunctions.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No functions found matching your criteria
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Function Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedFunction && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="font-mono text-xl">
                    {selectedFunction.name}
                  </DialogTitle>
                  <Badge variant="outline" className="capitalize">
                    {selectedFunction.category}
                  </Badge>
                </div>
                <DialogDescription>
                  {selectedFunction.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Syntax</h4>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {selectedFunction.syntax}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Parameters</h4>
                  <div className="border rounded-md divide-y">
                    {selectedFunction.parameters.map((param) => (
                      <div key={param.name} className="p-2 flex">
                        <div className="w-1/4 font-mono text-sm">
                          {param.name}
                        </div>
                        <div className="w-1/4 text-sm text-muted-foreground">
                          {param.type}
                          {param.optional && " (optional)"}
                        </div>
                        <div className="w-2/4 text-sm">{param.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Return Type</h4>
                  <div className="text-sm font-mono">
                    {selectedFunction.returnType}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Examples</h4>
                  {selectedFunction.examples.map((example, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm bg-muted p-2 rounded mb-2"
                    >
                      {example}
                    </div>
                  ))}
                </div>

                {selectedFunction.notes &&
                  selectedFunction.notes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Notes</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {selectedFunction.notes.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Close
                </Button>
                {onSelectFunction && (
                  <Button onClick={handleInsertFunction}>
                    Insert Function
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
