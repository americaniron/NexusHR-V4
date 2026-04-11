import { SignIn } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center space-y-2 text-center">
          <img src={`${import.meta.env.BASE_URL}nexushr-logo.png`} alt="NexsusHR" className="h-14 w-14 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome to NexsusHR</h1>
          <p className="text-sm text-muted-foreground">Sign in to command your AI workforce</p>
        </div>
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}
