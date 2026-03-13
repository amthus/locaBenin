import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateContract } from "@/hooks/useContracts";

const CreateContractDialog = () => {
  const { user } = useAuth();
  const createContract = useCreateContract();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tenant_email: "",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    deposit_amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // For now, use tenant email as tenant_id placeholder — in real flow you'd look up the user
    // We'll use the email to find the tenant profile
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: tenantProfiles } = await supabase
      .from("profiles")
      .select("user_id")
      .ilike("full_name", `%${form.tenant_email}%`)
      .limit(1);

    // If not found by name, try to use as user_id directly
    const tenantId = tenantProfiles?.[0]?.user_id || form.tenant_email;

    await createContract.mutateAsync({
      owner_id: user.id,
      tenant_id: tenantId,
      start_date: form.start_date,
      end_date: form.end_date,
      monthly_rent: Number(form.monthly_rent),
      deposit_amount: Number(form.deposit_amount),
    });

    setOpen(false);
    setForm({ tenant_email: "", start_date: "", end_date: "", monthly_rent: "", deposit_amount: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Nouveau contrat</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un contrat de bail</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nom ou ID du locataire</Label>
            <Input
              value={form.tenant_email}
              onChange={(e) => setForm({ ...form, tenant_email: e.target.value })}
              placeholder="Nom du locataire"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date de début</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            </div>
            <div>
              <Label>Date de fin</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Loyer mensuel (FCFA)</Label>
              <Input type="number" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} required />
            </div>
            <div>
              <Label>Caution (FCFA)</Label>
              <Input type="number" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createContract.isPending}>
            {createContract.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Créer le contrat
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContractDialog;
