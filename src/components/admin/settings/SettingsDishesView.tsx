import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, Search, Apple, CookingPot, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ===== TYPES =====
interface Ingredient {
  id: string;
  name: string;
  unit: string;
  allergens: string[];
}

interface Dish {
  id: string;
  name: string;
  description: string;
  ingredientIds: string[];
  price: number;
  category: string;
}

interface DishSet {
  id: string;
  name: string;
  description: string;
  dishIds: string[];
  pricePerPerson: number;
  minPersons: number;
}

// ===== MOCK DATA =====
const mockIngredients: Ingredient[] = [
  { id: "i1", name: "Kurczak", unit: "kg", allergens: [] },
  { id: "i2", name: "Mozzarella", unit: "g", allergens: ["mleko"] },
  { id: "i3", name: "Pomidory suszone", unit: "g", allergens: [] },
  { id: "i4", name: "Szpinak", unit: "g", allergens: [] },
  { id: "i5", name: "Mąka pszenna", unit: "kg", allergens: ["gluten"] },
  { id: "i6", name: "Łosoś", unit: "kg", allergens: ["ryby"] },
  { id: "i7", name: "Ryż", unit: "kg", allergens: [] },
  { id: "i8", name: "Awokado", unit: "szt.", allergens: [] },
];

const mockDishes: Dish[] = [
  { id: "d1", name: "Roladki z indyka ze szpinakiem", description: "Z suszonymi pomidorami i mozzarellą", ingredientIds: ["i1", "i2", "i3", "i4"], price: 28, category: "Mięsa" },
  { id: "d2", name: "Łosoś grillowany", description: "Z masłem czosnkowym", ingredientIds: ["i6"], price: 42, category: "Ryby" },
  { id: "d3", name: "Risotto z warzywami", description: "Kremowe risotto sezonowe", ingredientIds: ["i7", "i2"], price: 24, category: "Wegetariańskie" },
];

const mockSets: DishSet[] = [
  { id: "s1", name: "Zestaw nr 1 Klasyczny", description: "Idealny na spotkania firmowe", dishIds: ["d1", "d3"], pricePerPerson: 70, minPersons: 12 },
  { id: "s2", name: "Zestaw nr 2 Premium", description: "Menu premium z wykwintnymi daniami", dishIds: ["d1", "d2", "d3"], pricePerPerson: 95, minPersons: 15 },
];

// ===== COMPONENTS =====

const IngredientsTab = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newAllergens, setNewAllergens] = useState("");

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const addIngredient = () => {
    if (!newName.trim()) return;
    setIngredients([
      ...ingredients,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        unit: newUnit.trim() || "szt.",
        allergens: newAllergens
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      },
    ]);
    setNewName("");
    setNewUnit("");
    setNewAllergens("");
    setShowForm(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj składnika..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Dodaj składnik
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nazwa</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="np. Kurczak" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Jednostka</Label>
                <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="np. kg, g, szt." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Alergeny (po przecinku)</Label>
                <Input value={newAllergens} onChange={(e) => setNewAllergens(e.target.value)} placeholder="np. mleko, gluten" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addIngredient} disabled={!newName.trim()}>Dodaj</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Anuluj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-1.5">
        {filtered.map((ingredient) => (
          <div
            key={ingredient.id}
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Apple className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{ingredient.name}</span>
              <span className="text-xs text-muted-foreground">({ingredient.unit})</span>
              {ingredient.allergens.map((a) => (
                <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">
                  {a}
                </Badge>
              ))}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => removeIngredient(ingredient.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DishesTab = () => {
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [search, setSearch] = useState("");

  const filtered = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const removeDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Szukaj dania..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Dodaj danie
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map((dish) => (
          <Card key={dish.id} className="group hover:shadow-sm transition-shadow">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CookingPot className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{dish.name}</p>
                  <p className="text-xs text-muted-foreground">{dish.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{dish.category}</Badge>
                <span className="text-sm font-semibold text-primary">{dish.price} zł</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeDish(dish.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SetsTab = () => {
  const [sets, setSets] = useState<DishSet[]>(mockSets);

  const removeSet = (id: string) => {
    setSets(sets.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Zestawy składają się z dań i mają cenę za osobę</p>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Dodaj zestaw
        </Button>
      </div>

      <div className="space-y-2">
        {sets.map((set) => (
          <Card key={set.id} className="group hover:shadow-sm transition-shadow">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{set.name}</p>
                  <p className="text-xs text-muted-foreground">{set.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">min. {set.minPersons} os.</Badge>
                <span className="text-sm font-semibold text-primary">{set.pricePerPerson} zł/os.</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeSet(set.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ===== MAIN =====
const SettingsDishesView = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dania</h1>
        <p className="text-muted-foreground text-sm">Zarządzaj składnikami, daniami i zestawami</p>
      </div>

      <Tabs defaultValue="ingredients" className="max-w-4xl">
        <TabsList className="mb-4">
          <TabsTrigger value="ingredients" className="gap-1.5">
            <Apple className="w-3.5 h-3.5" />
            Składniki
          </TabsTrigger>
          <TabsTrigger value="dishes" className="gap-1.5">
            <CookingPot className="w-3.5 h-3.5" />
            Dania
          </TabsTrigger>
          <TabsTrigger value="sets" className="gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Zestawy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients">
          <IngredientsTab />
        </TabsContent>
        <TabsContent value="dishes">
          <DishesTab />
        </TabsContent>
        <TabsContent value="sets">
          <SetsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsDishesView;
