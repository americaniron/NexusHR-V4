import { useCreateTicket } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { HelpCircle, Book, LifeBuoy } from "lucide-react";

export default function HelpPage() {
  const createTicket = useCreateTicket();
  const { toast } = useToast();
  const [form, setForm] = useState({ subject: "", description: "", category: "general", priority: "low" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;

    try {
      await createTicket.mutateAsync({ data: form });
      toast({ title: "Support ticket submitted", description: "Our team will get back to you shortly." });
      setForm({ subject: "", description: "", category: "general", priority: "low" });
    } catch (err) {
      toast({ title: "Failed to submit ticket", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-1">Get assistance with your AI workforce.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-primary" />
                Contact Support
              </CardTitle>
              <CardDescription>Submit a ticket to our specialized technical team.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="agent_behavior">Agent Behavior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={5} required className="bg-background resize-none" />
                </div>
                <Button type="submit" disabled={createTicket.isPending} className="w-full sm:w-auto">Submit Ticket</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20 text-center py-8">
            <CardContent className="space-y-4">
              <Book className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold text-lg">Documentation</h3>
              <p className="text-sm text-muted-foreground px-4">Browse our comprehensive guides on agent deployment and workflow creation.</p>
              <Button variant="outline" className="w-full max-w-[200px] bg-background">View Docs</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
             <CardHeader>
               <CardTitle className="text-base">FAQ</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 text-sm">
               <div>
                 <p className="font-medium text-foreground">How long does deployment take?</p>
                 <p className="text-muted-foreground mt-1">Agents are deployed instantly upon hiring.</p>
               </div>
               <div>
                 <p className="font-medium text-foreground">Can I cancel an agent?</p>
                 <p className="text-muted-foreground mt-1">Yes, you can deactivate agents at any time. Billing is pro-rated.</p>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
