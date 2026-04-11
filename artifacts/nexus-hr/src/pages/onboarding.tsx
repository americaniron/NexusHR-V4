import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Users, Plug, MessageSquare, Rocket } from "lucide-react";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to NexsusHR",
    subtitle: "Your Autonomous AI Company OS",
    description: "NexsusHR lets you hire, deploy, and manage fully autonomous AI employees. Let's get you set up in a few quick steps.",
    icon: Rocket,
  },
  {
    id: "marketplace",
    title: "Browse the AI Marketplace",
    subtitle: "105+ Specialized Roles Available",
    description: "Explore our catalog of AI employees across departments — from HR and Customer Support to Sales, Engineering, Legal, and more. Each comes with specialized expertise ready to work.",
    icon: Users,
    action: { label: "Browse Marketplace", path: "/marketplace" },
  },
  {
    id: "integrations",
    title: "Connect Your Tools",
    subtitle: "20 Integrations Ready",
    description: "Link your existing tools — Google Workspace, Slack, HubSpot, Jira, GitHub, and more — so your AI employees can work where your team already works.",
    icon: Plug,
    action: { label: "View Integrations", path: "/integrations" },
  },
  {
    id: "conversation",
    title: "Start Your First Conversation",
    subtitle: "Chat with Your AI Team",
    description: "Once you've hired an AI employee, start a conversation. Ask questions, assign tasks, and see your AI team in action with real LLM-powered responses.",
    icon: MessageSquare,
    action: { label: "Go to Conversations", path: "/conversations" },
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("nexushr_onboarded", "true");
      navigate("/dashboard");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("nexushr_onboarded", "true");
    navigate("/dashboard");
  };

  const handleAction = () => {
    if (step.action) {
      localStorage.setItem("nexushr_onboarded", "true");
      navigate(step.action.path);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? "w-10 bg-primary" : idx < currentStep ? "w-6 bg-primary/60" : "w-6 bg-muted"
              }`}
            />
          ))}
        </div>

        <Card className="bg-card border-border shadow-xl">
          <CardContent className="p-10 text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{step.title}</h1>
              <p className="text-lg text-primary font-medium">{step.subtitle}</p>
            </div>

            <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
              {step.description}
            </p>

            {currentStep > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Step {currentStep} of {STEPS.length - 1} completed
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              {step.action && (
                <Button variant="outline" size="lg" onClick={handleAction} className="h-12 px-8">
                  {step.action.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button size="lg" onClick={handleNext} className="h-12 px-8 bg-primary text-primary-foreground">
                {isLast ? "Go to Dashboard" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Skip setup and go to dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
