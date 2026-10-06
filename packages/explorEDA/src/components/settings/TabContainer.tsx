import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabContainerProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children: {
    [key: string]: React.ReactNode;
  };
  tabs: {
    value: string;
    label: string;
  }[];
}

export function TabContainer({
  activeTab,
  onTabChange,
  children,
  tabs,
}: TabContainerProps) {
  return (
    <Tabs
      defaultValue={activeTab || tabs[0]?.value}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-none">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {children[tab.value]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
