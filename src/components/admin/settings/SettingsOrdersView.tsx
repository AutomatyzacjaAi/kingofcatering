import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const SettingsOrdersView = () => {
  const [minOrder, setMinOrder] = useState("200");
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [minLeadDays, setMinLeadDays] = useState("3");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Zamówienia</h1>
        <p className="text-muted-foreground text-sm">Ustawienia dotyczące zamówień</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parametry zamówień</CardTitle>
            <CardDescription>Wartości minimalne i limity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimalna wartość zamówienia (zł)</Label>
                <Input id="minOrder" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minLeadDays">Min. dni wyprzedzenia</Label>
                <Input id="minLeadDays" type="number" value={minLeadDays} onChange={(e) => setMinLeadDays(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatyczne potwierdzanie</Label>
                <p className="text-xs text-muted-foreground">Automatycznie potwierdzaj zamówienia</p>
              </div>
              <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Powiadomienia</CardTitle>
            <CardDescription>Zarządzaj powiadomieniami o zamówieniach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Powiadomienia email</Label>
                <p className="text-xs text-muted-foreground">Otrzymuj powiadomienia o nowych zamówieniach na email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Powiadomienia SMS</Label>
                <p className="text-xs text-muted-foreground">Otrzymuj powiadomienia SMS o nowych zamówieniach</p>
              </div>
              <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto">Zapisz zmiany</Button>
      </div>
    </div>
  );
};

export default SettingsOrdersView;
