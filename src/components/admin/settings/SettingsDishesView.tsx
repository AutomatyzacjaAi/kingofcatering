import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, Search, Apple, CookingPot, UtensilsCrossed, X, Check, ImagePlus, Package, Settings2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ===== TYPES =====
type UnitType = "g" | "ml" | "szt.";

const ALLERGEN_OPTIONS = [
  "gluten", "mleko", "jaja", "ryby", "skorupiaki", "soja",
  "orzechy", "sezam", "seler", "gorczyca", "łubin", "mięczaki",
];

const DIETARY_OPTIONS = [
  "Wegetariańskie", "Wegańskie", "Bezglutenowe", "Bez laktozy", "Keto",
];

interface Ingredient {
  id: string;
  name: string;
  unit: UnitType;
  allergens: string[];
  pricePerUnit: number;
}

interface DishIngredient {
  ingredientId: string;
  quantity: number;
}

interface Dish {
  id: string;
  name: string;
  image: string | null;
  priceNetto: number;
  vatRate: number;
  priceBrutto: number;
  ingredients: DishIngredient[];
  dietaryTags: string[];
}

// Bundle = group of variants (e.g. "Pierogi" with ruskie, z mięsem, etc.)
interface BundleVariant {
  id: string;
  dishId: string;
  // variant uses the dish as its base
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  image: string | null;
  priceNetto: number;
  vatRate: number;
  priceBrutto: number;
  minQuantity: number;
  variantDishIds: string[]; // dishes that are variants
}

// Configurable set = pick from groups of dishes
interface ConfigGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  dishIds: string[];
}

interface ConfigurableSet {
  id: string;
  name: string;
  description: string;
  image: string | null;
  pricePerPerson: number;
  minPersons: number;
  groups: ConfigGroup[];
}

// Extra item (e.g. dekoracja, podgrzewacze, świece LED)
interface ExtraItem {
  id: string;
  name: string;
  description: string;
  image: string | null;
  priceNetto: number;
  vatRate: number;
  priceBrutto: number;
  foodCost: number;
}

// ===== MOCK DATA =====
const mockIngredients: Ingredient[] = [
  { id: "i1", name: "Kurczak", unit: "g", allergens: [], pricePerUnit: 0.025 },
  { id: "i2", name: "Mozzarella", unit: "g", allergens: ["mleko"], pricePerUnit: 0.04 },
  { id: "i3", name: "Pomidory suszone", unit: "g", allergens: [], pricePerUnit: 0.06 },
  { id: "i4", name: "Szpinak", unit: "g", allergens: [], pricePerUnit: 0.03 },
  { id: "i5", name: "Oliwa z oliwek", unit: "ml", allergens: [], pricePerUnit: 0.05 },
  { id: "i6", name: "Łosoś", unit: "g", allergens: ["ryby"], pricePerUnit: 0.08 },
  { id: "i7", name: "Ryż", unit: "g", allergens: [], pricePerUnit: 0.008 },
  { id: "i8", name: "Awokado", unit: "szt.", allergens: [], pricePerUnit: 4.5 },
  { id: "i9", name: "Mleko kokosowe", unit: "ml", allergens: ["mleko"], pricePerUnit: 0.012 },
];

const mockDishes: Dish[] = [
  {
    id: "d1", name: "Roladki z indyka ze szpinakiem", image: null,
    priceNetto: 25.93, vatRate: 8, priceBrutto: 28, dietaryTags: [],
    ingredients: [
      { ingredientId: "i1", quantity: 200 },
      { ingredientId: "i2", quantity: 100 },
      { ingredientId: "i3", quantity: 50 },
      { ingredientId: "i4", quantity: 80 },
    ],
  },
  {
    id: "d2", name: "Łosoś grillowany", image: null,
    priceNetto: 38.89, vatRate: 8, priceBrutto: 42, dietaryTags: ["Bezglutenowe"],
    ingredients: [
      { ingredientId: "i6", quantity: 250 },
      { ingredientId: "i5", quantity: 20 },
    ],
  },
  {
    id: "d3", name: "Pierogi ruskie", image: null,
    priceNetto: 13.89, vatRate: 8, priceBrutto: 15, dietaryTags: ["Wegetariańskie"],
    ingredients: [],
  },
  {
    id: "d4", name: "Pierogi z mięsem", image: null,
    priceNetto: 14.81, vatRate: 8, priceBrutto: 16, dietaryTags: [],
    ingredients: [],
  },
  {
    id: "d5", name: "Pierogi z kapustą i grzybami", image: null,
    priceNetto: 12.96, vatRate: 8, priceBrutto: 14, dietaryTags: ["Wegetariańskie", "Wegańskie"],
    ingredients: [],
  },
  {
    id: "d6", name: "Żurek", image: null,
    priceNetto: 18.52, vatRate: 8, priceBrutto: 20, dietaryTags: [],
    ingredients: [],
  },
  {
    id: "d7", name: "Krem z pomidorów", image: null,
    priceNetto: 16.67, vatRate: 8, priceBrutto: 18, dietaryTags: ["Wegetariańskie", "Wegańskie", "Bezglutenowe"],
    ingredients: [],
  },
];

const mockBundles: Bundle[] = [
  {
    id: "b1", name: "Pierogi", description: "Wybierz rodzaj pierogów",
    image: null, priceNetto: 13.89, vatRate: 8, priceBrutto: 15,
    minQuantity: 10, variantDishIds: ["d3", "d4", "d5"],
  },
];

const mockConfigSets: ConfigurableSet[] = [
  {
    id: "cs1", name: "Zestaw Obiadowy", description: "Zupa + danie główne + deser",
    image: null, pricePerPerson: 70, minPersons: 12,
    groups: [
      { id: "g1", name: "Zupy", minSelections: 1, maxSelections: 2, dishIds: ["d6", "d7"] },
      { id: "g2", name: "Dania główne", minSelections: 2, maxSelections: 4, dishIds: ["d1", "d2"] },
    ],
  },
];

const mockExtras: ExtraItem[] = [
  { id: "ex1", name: "Dekoracja stołu", description: "Elegancka dekoracja kwiatowa na stół", image: null, priceNetto: 120, vatRate: 23, priceBrutto: 147.60, foodCost: 45 },
  { id: "ex2", name: "Świece LED", description: "Zestaw 10 świec LED na stół", image: null, priceNetto: 35, vatRate: 23, priceBrutto: 43.05, foodCost: 12 },
  { id: "ex3", name: "Podgrzewacze", description: "Podgrzewacze do dań w zestawach", image: null, priceNetto: 80, vatRate: 23, priceBrutto: 98.40, foodCost: 30 },
];

const VAT_RATES = [0, 5, 8, 23];

// ===== IMAGE UPLOAD PLACEHOLDER =====
const ImageUpload = ({ image, onChange }: { image: string | null; onChange: (img: string | null) => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs">Zdjęcie</Label>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={cn(
          "w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors",
          image && "border-solid border-border"
        )}
      >
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImagePlus className="w-6 h-6 text-muted-foreground" />
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

// ===== INGREDIENTS TAB =====
const IngredientsTab = ({ ingredients, setIngredients }: { ingredients: Ingredient[]; setIngredients: (v: Ingredient[]) => void }) => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState<UnitType>("g");
  const [newPrice, setNewPrice] = useState("");
  const [newAllergens, setNewAllergens] = useState<string[]>([]);

  const filtered = ingredients.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const toggleAllergen = (allergen: string) => {
    setNewAllergens((prev) => prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]);
  };

  const addIngredient = () => {
    if (!newName.trim()) return;
    setIngredients([...ingredients, {
      id: Date.now().toString(), name: newName.trim(), unit: newUnit,
      allergens: newAllergens, pricePerUnit: parseFloat(newPrice) || 0,
    }]);
    setNewName(""); setNewUnit("g"); setNewPrice(""); setNewAllergens([]); setShowForm(false);
  };

  const removeIngredient = (id: string) => setIngredients(ingredients.filter((i) => i.id !== id));

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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div className="space-y-1">
              <Label className="text-xs">Alergeny</Label>
              <div className="flex flex-wrap gap-1.5">
                {ALLERGEN_OPTIONS.map((allergen) => (
                  <button key={allergen} type="button" onClick={() => toggleAllergen(allergen)}
                    className={cn("px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                      newAllergens.includes(allergen) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                    )}>{allergen}</button>
                ))}
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
              {ingredient.allergens.map((a) => (
                <Badge key={a} variant="secondary" className="text-[10px] px-1.5 py-0">{a}</Badge>
              ))}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => removeIngredient(ingredient.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Brak składników</p>}
      </div>
    </div>
  );
};

// ===== DISHES TAB =====
const DishesTab = ({ dishes, setDishes, ingredients }: { dishes: Dish[]; setDishes: (v: Dish[]) => void; ingredients: Ingredient[] }) => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formPriceNetto, setFormPriceNetto] = useState("");
  const [formVat, setFormVat] = useState(8);
  const [formPriceBrutto, setFormPriceBrutto] = useState("");
  const [formIngredients, setFormIngredients] = useState<DishIngredient[]>([]);
  const [formDietaryTags, setFormDietaryTags] = useState<string[]>([]);
  const [showIngredientList, setShowIngredientList] = useState(false);

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

  const toggleIngredient = (ingredientId: string) => {
    if (formIngredients.some((fi) => fi.ingredientId === ingredientId)) {
      setFormIngredients(formIngredients.filter((fi) => fi.ingredientId !== ingredientId));
    } else {
      setFormIngredients([...formIngredients, { ingredientId, quantity: 0 }]);
    }
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    setFormIngredients(formIngredients.map((fi) => fi.ingredientId === ingredientId ? { ...fi, quantity } : fi));
  };

  const removeIngredientFromDish = (ingredientId: string) => {
    setFormIngredients(formIngredients.filter((fi) => fi.ingredientId !== ingredientId));
  };

  const resetForm = () => {
    setFormName(""); setFormImage(null); setFormPriceNetto(""); setFormVat(8);
    setFormPriceBrutto(""); setFormIngredients([]); setFormDietaryTags([]); setShowForm(false);
    setEditingId(null); setShowIngredientList(false);
  };

  const toggleDietaryTag = (tag: string) => {
    setFormDietaryTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const saveDish = () => {
    if (!formName.trim()) return;
    const dish: Dish = {
      id: editingId || Date.now().toString(), name: formName.trim(), image: formImage,
      priceNetto: parseFloat(formPriceNetto) || 0, vatRate: formVat,
      priceBrutto: parseFloat(formPriceBrutto) || 0, ingredients: formIngredients,
      dietaryTags: formDietaryTags,
    };
    if (editingId) {
      setDishes(dishes.map((d) => (d.id === editingId ? dish : d)));
    } else {
      setDishes([...dishes, dish]);
    }
    resetForm();
  };

  const startEdit = (dish: Dish) => {
    setEditingId(dish.id); setFormName(dish.name); setFormImage(dish.image);
    setFormPriceNetto(dish.priceNetto.toString()); setFormVat(dish.vatRate);
    setFormPriceBrutto(dish.priceBrutto.toString()); setFormIngredients([...dish.ingredients]);
    setFormDietaryTags([...(dish.dietaryTags || [])]);
    setShowForm(true);
  };

  const removeDish = (id: string) => setDishes(dishes.filter((d) => d.id !== id));

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
            <div className="flex gap-4">
              <ImageUpload image={formImage} onChange={setFormImage} />
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Nazwa dania</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="np. Roladki z indyka" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cena netto (zł)</Label>
                <Input type="number" step="0.01" value={formPriceNetto} onChange={(e) => handleNettoChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stawka VAT</Label>
                <Select value={formVat.toString()} onValueChange={handleVatChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((rate) => (<SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>))}
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
                    <span className="text-muted-foreground">({((foodCost / parseFloat(formPriceBrutto)) * 100).toFixed(1)}%)</span>
                  )}
                </div>
              </div>

              {/* Selected ingredients with quantities */}
              {formIngredients.length > 0 && (
                <div className="space-y-1.5">
                  {formIngredients.map((fi) => {
                    const ing = ingredients.find((i) => i.id === fi.ingredientId);
                    if (!ing) return null;
                    const cost = ing.pricePerUnit * fi.quantity;
                    return (
                      <div key={fi.ingredientId} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30">
                        <span className="text-sm flex-1">{ing.name}</span>
                        <Input type="number" value={fi.quantity || ""} onChange={(e) => updateIngredientQuantity(fi.ingredientId, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-xs text-center" placeholder="0" />
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

              {/* Add ingredient - show full list */}
              <Button type="button" size="sm" variant="outline" onClick={() => setShowIngredientList(!showIngredientList)} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                {showIngredientList ? "Ukryj listę składników" : "Dodaj składnik"}
              </Button>

              {showIngredientList && (
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                  {ingredients.map((ing) => {
                    const isSelected = formIngredients.some((fi) => fi.ingredientId === ing.id);
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleIngredient(ing.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-xs flex items-center justify-between border-b border-border last:border-b-0 transition-colors",
                          isSelected ? "bg-accent/50" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isSelected} className="w-3.5 h-3.5 pointer-events-none" />
                          <span className="font-medium">{ing.name}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{ing.unit}</Badge>
                        </div>
                        <span className="text-muted-foreground">{ing.pricePerUnit.toFixed(3)} zł/{ing.unit}</span>
                      </button>
                    );
                  })}
                  {ingredients.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">Brak składników — dodaj je w zakładce Składniki</p>}
                </div>
              )}
            </div>

            {/* Dietary tags */}
            <div className="space-y-2">
              <Label className="text-xs">Rodzaj diety</Label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleDietaryTag(tag)}
                    className={cn("px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                      formDietaryTags.includes(tag) ? "bg-accent text-accent-foreground border-accent" : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                    )}>{tag}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={saveDish} disabled={!formName.trim()}>
                <Check className="w-4 h-4 mr-1" />{editingId ? "Zapisz" : "Dodaj danie"}
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
                  {dish.image ? (
                    <img src={dish.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <CookingPot className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{dish.name}</p>
                      {dish.dietaryTags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{dish.ingredients.length} składników · food cost: {dishFoodCost.toFixed(2)} zł</p>
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
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Brak dań</p>}
      </div>
    </div>
  );
};

// ===== BUNDLES TAB (Pakiety) =====
const BundlesTab = ({ bundles, setBundles, dishes }: { bundles: Bundle[]; setBundles: (v: Bundle[]) => void; dishes: Dish[] }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formPriceNetto, setFormPriceNetto] = useState("");
  const [formVat, setFormVat] = useState(8);
  const [formPriceBrutto, setFormPriceBrutto] = useState("");
  const [formMinQty, setFormMinQty] = useState("1");
  const [formDishIds, setFormDishIds] = useState<string[]>([]);
  const [showDishList, setShowDishList] = useState(false);

  const calcBrutto = (n: number, v: number) => +(n * (1 + v / 100)).toFixed(2);
  const calcNetto = (b: number, v: number) => +(b / (1 + v / 100)).toFixed(2);

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

  const toggleDish = (id: string) => {
    setFormDishIds((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setFormName(""); setFormDesc(""); setFormImage(null); setFormPriceNetto("");
    setFormVat(8); setFormPriceBrutto(""); setFormMinQty("1"); setFormDishIds([]);
    setShowForm(false); setEditingId(null); setShowDishList(false);
  };

  const save = () => {
    if (!formName.trim()) return;
    const bundle: Bundle = {
      id: editingId || Date.now().toString(), name: formName.trim(), description: formDesc.trim(),
      image: formImage, priceNetto: parseFloat(formPriceNetto) || 0, vatRate: formVat,
      priceBrutto: parseFloat(formPriceBrutto) || 0, minQuantity: parseInt(formMinQty) || 1,
      variantDishIds: formDishIds,
    };
    if (editingId) setBundles(bundles.map((b) => b.id === editingId ? bundle : b));
    else setBundles([...bundles, bundle]);
    resetForm();
  };

  const startEdit = (b: Bundle) => {
    setEditingId(b.id); setFormName(b.name); setFormDesc(b.description); setFormImage(b.image);
    setFormPriceNetto(b.priceNetto.toString()); setFormVat(b.vatRate);
    setFormPriceBrutto(b.priceBrutto.toString()); setFormMinQty(b.minQuantity.toString());
    setFormDishIds([...b.variantDishIds]); setShowForm(true);
  };

  const remove = (id: string) => setBundles(bundles.filter((b) => b.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Pakiety grupują warianty dań (np. „Pierogi" z różnymi nadzieniami)</p>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />
          Dodaj pakiet
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editingId ? "Edytuj pakiet" : "Nowy pakiet"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <ImageUpload image={formImage} onChange={setFormImage} />
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nazwa pakietu</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="np. Pierogi" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Opis</Label>
                  <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Krótki opis pakietu" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cena netto (zł)</Label>
                <Input type="number" step="0.01" value={formPriceNetto} onChange={(e) => handleNettoChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">VAT</Label>
                <Select value={formVat.toString()} onValueChange={handleVatChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((r) => (<SelectItem key={r} value={r.toString()}>{r}%</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cena brutto (zł)</Label>
                <Input type="number" step="0.01" value={formPriceBrutto} onChange={(e) => handleBruttoChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min. ilość</Label>
                <Input type="number" value={formMinQty} onChange={(e) => setFormMinQty(e.target.value)} placeholder="1" />
              </div>
            </div>

            {/* Variant dishes */}
            <div className="space-y-2">
              <Label className="text-xs">Warianty (dania do wyboru w pakiecie)</Label>
              {formDishIds.length > 0 && (
                <div className="space-y-1">
                  {formDishIds.map((did) => {
                    const d = dishes.find((dd) => dd.id === did);
                    if (!d) return null;
                    return (
                      <div key={did} className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/30">
                        <span className="text-xs font-medium">{d.name}</span>
                        <button onClick={() => toggleDish(did)} className="p-1 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button type="button" size="sm" variant="outline" onClick={() => setShowDishList(!showDishList)} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />{showDishList ? "Ukryj listę" : "Wybierz dania"}
              </Button>
              {showDishList && (
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                  {dishes.map((d) => {
                    const sel = formDishIds.includes(d.id);
                    return (
                      <button key={d.id} type="button" onClick={() => toggleDish(d.id)}
                        className={cn("w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 border-b border-border last:border-b-0 transition-colors", sel ? "bg-accent/50" : "hover:bg-muted/50")}>
                        <Checkbox checked={sel} className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground ml-auto">{d.priceBrutto.toFixed(2)} zł</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={save} disabled={!formName.trim()}>
                <Check className="w-4 h-4 mr-1" />{editingId ? "Zapisz" : "Dodaj pakiet"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Anuluj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {bundles.map((b) => (
          <Card key={b.id} className="group hover:shadow-sm transition-shadow">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {b.image ? <img src={b.image} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Package className="w-5 h-5 text-primary" />}
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.variantDishIds.length} wariantów · min. {b.minQuantity} szt.</p>
                </div>
                <span className="text-sm font-semibold text-primary">{b.priceBrutto.toFixed(2)} zł</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(b)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(b.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
        {bundles.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-6">Brak pakietów</p>}
      </div>
    </div>
  );
};

// ===== CONFIGURABLE SETS TAB =====
const ConfigSetsTab = ({ configSets, setConfigSets, dishes }: { configSets: ConfigurableSet[]; setConfigSets: (v: ConfigurableSet[]) => void; dishes: Dish[] }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formPrice, setFormPrice] = useState("");
  const [formMinPersons, setFormMinPersons] = useState("10");
  const [formGroups, setFormGroups] = useState<ConfigGroup[]>([]);

  // Group form
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMin, setGroupMin] = useState("1");
  const [groupMax, setGroupMax] = useState("3");
  const [groupDishIds, setGroupDishIds] = useState<string[]>([]);
  const [showGroupDishList, setShowGroupDishList] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const resetForm = () => {
    setFormName(""); setFormDesc(""); setFormImage(null); setFormPrice("");
    setFormMinPersons("10"); setFormGroups([]); setShowForm(false); setEditingId(null);
    resetGroupForm();
  };

  const resetGroupForm = () => {
    setGroupName(""); setGroupMin("1"); setGroupMax("3"); setGroupDishIds([]);
    setShowGroupForm(false); setShowGroupDishList(false); setEditingGroupId(null);
  };

  const toggleGroupDish = (id: string) => {
    setGroupDishIds((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const saveGroup = () => {
    if (!groupName.trim()) return;
    const group: ConfigGroup = {
      id: editingGroupId || Date.now().toString(), name: groupName.trim(),
      minSelections: parseInt(groupMin) || 1, maxSelections: parseInt(groupMax) || 3,
      dishIds: groupDishIds,
    };
    if (editingGroupId) {
      setFormGroups(formGroups.map((g) => g.id === editingGroupId ? group : g));
    } else {
      setFormGroups([...formGroups, group]);
    }
    resetGroupForm();
  };

  const editGroup = (g: ConfigGroup) => {
    setEditingGroupId(g.id); setGroupName(g.name); setGroupMin(g.minSelections.toString());
    setGroupMax(g.maxSelections.toString()); setGroupDishIds([...g.dishIds]); setShowGroupForm(true);
  };

  const removeGroup = (id: string) => setFormGroups(formGroups.filter((g) => g.id !== id));

  const save = () => {
    if (!formName.trim()) return;
    const cs: ConfigurableSet = {
      id: editingId || Date.now().toString(), name: formName.trim(), description: formDesc.trim(),
      image: formImage, pricePerPerson: parseFloat(formPrice) || 0,
      minPersons: parseInt(formMinPersons) || 10, groups: formGroups,
    };
    if (editingId) setConfigSets(configSets.map((c) => c.id === editingId ? cs : c));
    else setConfigSets([...configSets, cs]);
    resetForm();
  };

  const startEdit = (cs: ConfigurableSet) => {
    setEditingId(cs.id); setFormName(cs.name); setFormDesc(cs.description); setFormImage(cs.image);
    setFormPrice(cs.pricePerPerson.toString()); setFormMinPersons(cs.minPersons.toString());
    setFormGroups([...cs.groups]); setShowForm(true);
  };

  const remove = (id: string) => setConfigSets(configSets.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Zestawy konfigurowalne — klient wybiera dania z grup (np. zupy, dania główne, desery)</p>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />
          Dodaj zestaw
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editingId ? "Edytuj zestaw" : "Nowy zestaw konfigurowalny"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <ImageUpload image={formImage} onChange={setFormImage} />
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nazwa zestawu</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="np. Zestaw Obiadowy" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Opis</Label>
                  <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Krótki opis zestawu" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cena za osobę (zł)</Label>
                <Input type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min. liczba osób</Label>
                <Input type="number" value={formMinPersons} onChange={(e) => setFormMinPersons(e.target.value)} placeholder="10" />
              </div>
            </div>

            {/* Groups */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Grupy dań</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => { resetGroupForm(); setShowGroupForm(true); }} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Dodaj grupę
                </Button>
              </div>

              {formGroups.map((g) => (
                <div key={g.id} className="p-3 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{g.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (wybór: {g.minSelections}–{g.maxSelections})
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editGroup(g)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeGroup(g.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.dishIds.map((did) => {
                      const d = dishes.find((dd) => dd.id === did);
                      return d ? <Badge key={did} variant="secondary" className="text-[10px]">{d.name}</Badge> : null;
                    })}
                  </div>
                </div>
              ))}

              {showGroupForm && (
                <div className="p-3 rounded-lg border-2 border-dashed border-primary/30 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nazwa grupy</Label>
                      <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="np. Zupy" className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Min. wybór</Label>
                      <Input type="number" value={groupMin} onChange={(e) => setGroupMin(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max. wybór</Label>
                      <Input type="number" value={groupMax} onChange={(e) => setGroupMax(e.target.value)} className="h-8 text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowGroupDishList(!showGroupDishList)} className="text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" />{showGroupDishList ? "Ukryj dania" : "Wybierz dania"}
                    </Button>
                    {groupDishIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {groupDishIds.map((did) => {
                          const d = dishes.find((dd) => dd.id === did);
                          return d ? (
                            <Badge key={did} variant="secondary" className="text-[10px] gap-1">
                              {d.name}
                              <button onClick={() => toggleGroupDish(did)}><X className="w-2.5 h-2.5" /></button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    {showGroupDishList && (
                      <div className="border border-border rounded-lg max-h-40 overflow-y-auto mt-1">
                        {dishes.map((d) => {
                          const sel = groupDishIds.includes(d.id);
                          return (
                            <button key={d.id} type="button" onClick={() => toggleGroupDish(d.id)}
                              className={cn("w-full text-left px-3 py-2 text-xs flex items-center gap-2 border-b border-border last:border-b-0", sel ? "bg-accent/50" : "hover:bg-muted/50")}>
                              <Checkbox checked={sel} className="w-3.5 h-3.5 pointer-events-none" />
                              <span>{d.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveGroup} disabled={!groupName.trim()} className="text-xs">
                      {editingGroupId ? "Zapisz grupę" : "Dodaj grupę"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetGroupForm} className="text-xs">Anuluj</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={save} disabled={!formName.trim()}>
                <Check className="w-4 h-4 mr-1" />{editingId ? "Zapisz" : "Dodaj zestaw"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Anuluj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {configSets.map((cs) => (
          <Card key={cs.id} className="group hover:shadow-sm transition-shadow">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {cs.image ? <img src={cs.image} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Settings2 className="w-5 h-5 text-primary" />}
                <div>
                  <p className="text-sm font-medium">{cs.name}</p>
                  <p className="text-xs text-muted-foreground">{cs.groups.length} grup · min. {cs.minPersons} os.</p>
                </div>
                <span className="text-sm font-semibold text-primary">{cs.pricePerPerson} zł/os.</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(cs)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(cs.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
        {configSets.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-6">Brak zestawów konfigurowalnych</p>}
      </div>
    </div>
  );
};

// ===== EXTRAS TAB =====
const ExtrasTab = ({ extras, setExtras }: { extras: ExtraItem[]; setExtras: (v: ExtraItem[]) => void }) => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formPriceNetto, setFormPriceNetto] = useState("");
  const [formVat, setFormVat] = useState(23);
  const [formPriceBrutto, setFormPriceBrutto] = useState("");
  const [formFoodCost, setFormFoodCost] = useState("");

  const filtered = extras.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

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

  const resetForm = () => {
    setFormName(""); setFormDesc(""); setFormImage(null); setFormPriceNetto("");
    setFormVat(23); setFormPriceBrutto(""); setFormFoodCost("");
    setShowForm(false); setEditingId(null);
  };

  const saveExtra = () => {
    if (!formName.trim()) return;
    const extra: ExtraItem = {
      id: editingId || Date.now().toString(),
      name: formName.trim(),
      description: formDesc.trim(),
      image: formImage,
      priceNetto: parseFloat(formPriceNetto) || 0,
      vatRate: formVat,
      priceBrutto: parseFloat(formPriceBrutto) || 0,
      foodCost: parseFloat(formFoodCost) || 0,
    };
    if (editingId) {
      setExtras(extras.map((e) => e.id === editingId ? extra : e));
    } else {
      setExtras([...extras, extra]);
    }
    resetForm();
  };

  const startEdit = (extra: ExtraItem) => {
    setEditingId(extra.id); setFormName(extra.name); setFormDesc(extra.description);
    setFormImage(extra.image); setFormPriceNetto(extra.priceNetto.toString());
    setFormVat(extra.vatRate); setFormPriceBrutto(extra.priceBrutto.toString());
    setFormFoodCost(extra.foodCost.toString()); setShowForm(true);
  };

  const removeExtra = (id: string) => setExtras(extras.filter((e) => e.id !== id));

  const foodCostMargin = (extra: ExtraItem) => {
    if (extra.priceNetto <= 0) return null;
    return ((extra.foodCost / extra.priceNetto) * 100).toFixed(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Szukaj dodatku..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />
          Dodaj dodatek
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editingId ? "Edytuj dodatek" : "Nowy dodatek"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <ImageUpload image={formImage} onChange={setFormImage} />
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nazwa</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="np. Dekoracja stołu" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Opis</Label>
                  <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Krótki opis dodatku..." />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cena netto (zł)</Label>
                <Input type="number" step="0.01" value={formPriceNetto} onChange={(e) => handleNettoChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">VAT</Label>
                <Select value={formVat.toString()} onValueChange={handleVatChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((rate) => (<SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cena brutto (zł)</Label>
                <Input type="number" step="0.01" value={formPriceBrutto} onChange={(e) => handleBruttoChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Food cost (zł)</Label>
                <Input type="number" step="0.01" value={formFoodCost} onChange={(e) => setFormFoodCost(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            {parseFloat(formFoodCost) > 0 && parseFloat(formPriceNetto) > 0 && (
              <div className="text-xs text-muted-foreground">
                Food cost: <span className="font-semibold text-foreground">{((parseFloat(formFoodCost) / parseFloat(formPriceNetto)) * 100).toFixed(0)}%</span> ceny netto
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={saveExtra} disabled={!formName.trim()}>
                {editingId ? "Zapisz" : "Dodaj"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Anuluj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-1.5">
        {filtered.map((extra) => (
          <div key={extra.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {extra.image ? (
                <img src={extra.image} alt="" className="w-10 h-10 rounded-md object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div>
                <span className="text-sm font-medium">{extra.name}</span>
                {extra.description && <p className="text-xs text-muted-foreground">{extra.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-xs">
                <div className="font-semibold text-foreground">{extra.priceBrutto.toFixed(2)} zł</div>
                <div className="text-muted-foreground">{extra.priceNetto.toFixed(2)} netto • VAT {extra.vatRate}%</div>
              </div>
              {extra.foodCost > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  FC: {extra.foodCost.toFixed(2)} zł ({foodCostMargin(extra)}%)
                </Badge>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(extra)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeExtra(extra.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-6">Brak dodatków</p>}
      </div>
    </div>
  );
};

// ===== MAIN =====
const SettingsDishesView = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [bundles, setBundles] = useState<Bundle[]>(mockBundles);
  const [configSets, setConfigSets] = useState<ConfigurableSet[]>(mockConfigSets);
  const [extras, setExtras] = useState<ExtraItem[]>(mockExtras);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dania</h1>
        <p className="text-muted-foreground text-sm">Zarządzaj składnikami, daniami, pakietami, zestawami i dodatkami</p>
      </div>

      <Tabs defaultValue="ingredients">
        <TabsList className="mb-4">
          <TabsTrigger value="ingredients" className="gap-1.5">
            <Apple className="w-3.5 h-3.5" />
            Składniki
          </TabsTrigger>
          <TabsTrigger value="dishes" className="gap-1.5">
            <CookingPot className="w-3.5 h-3.5" />
            Dania
          </TabsTrigger>
          <TabsTrigger value="bundles" className="gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Pakiety
          </TabsTrigger>
          <TabsTrigger value="configsets" className="gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Zestawy
          </TabsTrigger>
          <TabsTrigger value="extras" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Dodatki
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients">
          <IngredientsTab ingredients={ingredients} setIngredients={setIngredients} />
        </TabsContent>
        <TabsContent value="dishes">
          <DishesTab dishes={dishes} setDishes={setDishes} ingredients={ingredients} />
        </TabsContent>
        <TabsContent value="bundles">
          <BundlesTab bundles={bundles} setBundles={setBundles} dishes={dishes} />
        </TabsContent>
        <TabsContent value="configsets">
          <ConfigSetsTab configSets={configSets} setConfigSets={setConfigSets} dishes={dishes} />
        </TabsContent>
        <TabsContent value="extras">
          <ExtrasTab extras={extras} setExtras={setExtras} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsDishesView;
