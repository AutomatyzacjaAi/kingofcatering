import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, Search, Apple, CookingPot, UtensilsCrossed, X, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ===== TYPES =====
type UnitType = "g" | "ml" | "szt.";

interface Ingredient {
  id: string;
  name: string;
  unit: UnitType;
  pricePerUnit: number; // price per 1g, 1ml or 1szt.
}

interface DishIngredient {
  ingredientId: string;
  quantity: number;
}

interface Dish {
  id: string;
  name: string;
  priceNetto: number;
  vatRate: number; // e.g. 8, 23
  priceBrutto: number;
  ingredients: DishIngredient[];
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
  { id: "i1", name: "Kurczak", unit: "g", pricePerUnit: 0.025 },
  { id: "i2", name: "Mozzarella", unit: "g", pricePerUnit: 0.04 },
  { id: "i3", name: "Pomidory suszone", unit: "g", pricePerUnit: 0.06 },
  { id: "i4", name: "Szpinak", unit: "g", pricePerUnit: 0.03 },
  { id: "i5", name: "Oliwa z oliwek", unit: "ml", pricePerUnit: 0.05 },
  { id: "i6", name: "Łosoś", unit: "g", pricePerUnit: 0.08 },
  { id: "i7", name: "Ryż", unit: "g", pricePerUnit: 0.008 },
  { id: "i8", name: "Awokado", unit: "szt.", pricePerUnit: 4.5 },
  { id: "i9", name: "Mleko kokosowe", unit: "ml", pricePerUnit: 0.012 },
];

const mockDishes: Dish[] = [
  {
    id: "d1",
    name: "Roladki z indyka ze szpinakiem",
    priceNetto: 25.93,
    vatRate: 8,
    priceBrutto: 28,
    ingredients: [
      { ingredientId: "i1", quantity: 200 },
      { ingredientId: "i2", quantity: 100 },
      { ingredientId: "i3", quantity: 50 },
      { ingredientId: "i4", quantity: 80 },
    ],
  },
  {
    id: "d2",
    name: "Łosoś grillowany",
    priceNetto: 38.89,
    vatRate: 8,
    priceBrutto: 42,
    ingredients: [
      { ingredientId: "i6", quantity: 250 },
      { ingredientId: "i5", quantity: 20 },
    ],
  },
];

const mockSets: DishSet[] = [
  { id: "s1", name: "Zestaw nr 1 Klasyczny", description: "Idealny na spotkania firmowe", dishIds: ["d1"], pricePerPerson: 70, minPersons: 12 },
  { id: "s2", name: "Zestaw nr 2 Premium", description: "Menu premium z wykwintnymi daniami", dishIds: ["d1", "d2"], pricePerPerson: 95, minPersons: 15 },
];

const VAT_RATES = [0, 5, 8, 23];

// ===== INGREDIENTS TAB =====
const IngredientsTab = ({ ingredients, setIngredients }: { ingredients: Ingredient[]; setIngredients: (v: Ingredient[]) => void }) => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState<UnitType>("g");
  const [newPrice, setNewPrice] = useState("");

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
        unit: newUnit,
        pricePerUnit: parseFloat(newPrice) || 0,
      },
    ]);
    setNewName("");
    setNewUnit("g");
    setNewPrice("");
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
          <Input placeholder="Szukaj składnika..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                <Select value={newUnit} onValueChange={(v) => setNewUnit(v as UnitType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g (gramy)</SelectItem>
                    <SelectItem value="ml">ml (mililitry)</SelectItem>
                    <SelectItem value="szt.">szt. (sztuki)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cena za 1 {newUnit} (zł)</Label>
                <Input type="number" step="0.001" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0.00" />
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
          <div key={ingredient.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Apple className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{ingredient.name}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{ingredient.unit}</Badge>
              <span className="text-xs text-muted-foreground">{ingredient.pricePerUnit.toFixed(3)} zł/{ingredient.unit}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => removeIngredient(ingredient.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Brak składników</p>
        )}
      </div>
    </div>
  );
};

// ===== DISHES TAB =====
const DishesTab = ({ dishes, setDishes, ingredients }: { dishes: Dish[]; setDishes: (v: Dish[]) => void; ingredients: Ingredient[] }) => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPriceNetto, setFormPriceNetto] = useState("");
  const [formVat, setFormVat] = useState(8);
  const [formPriceBrutto, setFormPriceBrutto] = useState("");
  const [formIngredients, setFormIngredients] = useState<DishIngredient[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);

  const filtered = dishes.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const calcBrutto = (netto: number, vat: number) => +(netto * (1 + vat / 100)).toFixed(2);
  const calcNetto = (brutto: number, vat: number) => +(brutto / (1 + vat / 100)).toFixed(2);

  const handleNettoChange = (val: string) => {
    setFormPriceNetto(val);
    const n = parseFloat(val);
    if (!isNaN(n)) setFormPriceBrutto(calcBrutto(n, formVat).toString());
  };

  const handleBruttoChange = (val: string) => {
    setFormPriceBrutto(val);
    const b = parseFloat(val);
    if (!isNaN(b)) setFormPriceNetto(calcNetto(b, formVat).toString());
  };

  const handleVatChange = (val: string) => {
    const vat = parseInt(val);
    setFormVat(vat);
    const n = parseFloat(formPriceNetto);
    if (!isNaN(n)) setFormPriceBrutto(calcBrutto(n, vat).toString());
  };

  const foodCost = formIngredients.reduce((sum, fi) => {
    const ing = ingredients.find((i) => i.id === fi.ingredientId);
    return sum + (ing ? ing.pricePerUnit * fi.quantity : 0);
  }, 0);

  const addIngredientToDish = (ingredientId: string) => {
    if (formIngredients.some((fi) => fi.ingredientId === ingredientId)) return;
    setFormIngredients([...formIngredients, { ingredientId, quantity: 0 }]);
    setIngredientSearch("");
    setShowIngredientPicker(false);
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    setFormIngredients(formIngredients.map((fi) => fi.ingredientId === ingredientId ? { ...fi, quantity } : fi));
  };

  const removeIngredientFromDish = (ingredientId: string) => {
    setFormIngredients(formIngredients.filter((fi) => fi.ingredientId !== ingredientId));
  };

  const resetForm = () => {
    setFormName("");
    setFormPriceNetto("");
    setFormVat(8);
    setFormPriceBrutto("");
    setFormIngredients([]);
    setShowForm(false);
    setEditingId(null);
  };

  const saveDish = () => {
    if (!formName.trim()) return;
    const dish: Dish = {
      id: editingId || Date.now().toString(),
      name: formName.trim(),
      priceNetto: parseFloat(formPriceNetto) || 0,
      vatRate: formVat,
      priceBrutto: parseFloat(formPriceBrutto) || 0,
      ingredients: formIngredients,
    };

    if (editingId) {
      setDishes(dishes.map((d) => (d.id === editingId ? dish : d)));
    } else {
      setDishes([...dishes, dish]);
    }
    resetForm();
  };

  const startEdit = (dish: Dish) => {
    setEditingId(dish.id);
    setFormName(dish.name);
    setFormPriceNetto(dish.priceNetto.toString());
    setFormVat(dish.vatRate);
    setFormPriceBrutto(dish.priceBrutto.toString());
    setFormIngredients([...dish.ingredients]);
    setShowForm(true);
  };

  const removeDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const availableIngredients = ingredients.filter(
    (i) =>
      !formIngredients.some((fi) => fi.ingredientId === i.id) &&
      i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Szukaj dania..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />
          Dodaj danie
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editingId ? "Edytuj danie" : "Nowe danie"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label className="text-xs">Nazwa dania</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="np. Roladki z indyka" />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cena netto (zł)</Label>
                <Input type="number" step="0.01" value={formPriceNetto} onChange={(e) => handleNettoChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stawka VAT</Label>
                <Select value={formVat.toString()} onValueChange={handleVatChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((rate) => (
                      <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cena brutto (zł)</Label>
                <Input type="number" step="0.01" value={formPriceBrutto} onChange={(e) => handleBruttoChange(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Składniki</Label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Food cost:</span>
                  <span className="font-semibold text-primary">{foodCost.toFixed(2)} zł</span>
                  {parseFloat(formPriceBrutto) > 0 && (
                    <span className="text-muted-foreground">
                      ({((foodCost / parseFloat(formPriceBrutto)) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>

              {formIngredients.length > 0 && (
                <div className="space-y-1.5">
                  {formIngredients.map((fi) => {
                    const ing = ingredients.find((i) => i.id === fi.ingredientId);
                    if (!ing) return null;
                    const cost = ing.pricePerUnit * fi.quantity;
                    return (
                      <div key={fi.ingredientId} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30">
                        <span className="text-sm flex-1">{ing.name}</span>
                        <Input
                          type="number"
                          value={fi.quantity || ""}
                          onChange={(e) => updateIngredientQuantity(fi.ingredientId, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-xs text-center"
                          placeholder="0"
                        />
                        <span className="text-xs text-muted-foreground w-8">{ing.unit}</span>
                        <span className="text-xs font-medium w-16 text-right">{cost.toFixed(2)} zł</span>
                        <button onClick={() => removeIngredientFromDish(fi.ingredientId)} className="p-1 text-muted-foreground hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add ingredient */}
              <div className="relative">
                <Input
                  value={ingredientSearch}
                  onChange={(e) => { setIngredientSearch(e.target.value); setShowIngredientPicker(true); }}
                  onFocus={() => setShowIngredientPicker(true)}
                  placeholder="Dodaj składnik..."
                  className="h-8 text-xs"
                />
                {showIngredientPicker && ingredientSearch.length > 0 && (
                  <div className="absolute top-9 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {availableIngredients.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3 text-center">Brak wyników</p>
                    ) : (
                      availableIngredients.slice(0, 8).map((ing) => (
                        <button
                          key={ing.id}
                          onClick={() => addIngredientToDish(ing.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center justify-between"
                        >
                          <span>{ing.name}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{ing.unit}</Badge>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={saveDish} disabled={!formName.trim()}>
                <Check className="w-4 h-4 mr-1" />
                {editingId ? "Zapisz" : "Dodaj danie"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Anuluj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map((dish) => {
          const dishFoodCost = dish.ingredients.reduce((sum, fi) => {
            const ing = ingredients.find((i) => i.id === fi.ingredientId);
            return sum + (ing ? ing.pricePerUnit * fi.quantity : 0);
          }, 0);

          return (
            <Card key={dish.id} className="group hover:shadow-sm transition-shadow">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CookingPot className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dish.ingredients.length} składników · food cost: {dishFoodCost.toFixed(2)} zł
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{dish.priceNetto.toFixed(2)} netto</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">VAT {dish.vatRate}%</Badge>
                    <span className="text-sm font-semibold text-primary">{dish.priceBrutto.toFixed(2)} zł</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(dish)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => removeDish(dish.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Brak dań</p>
        )}
      </div>
    </div>
  );
};

// ===== SETS TAB =====
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
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);

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
          <IngredientsTab ingredients={ingredients} setIngredients={setIngredients} />
        </TabsContent>
        <TabsContent value="dishes">
          <DishesTab dishes={dishes} setDishes={setDishes} ingredients={ingredients} />
        </TabsContent>
        <TabsContent value="sets">
          <SetsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsDishesView;
