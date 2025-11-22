import { Metadata } from "next";
import DunkForm from "@/components/dunk-form";

export const metadata: Metadata = {
  title: "Create Dunk",
  description: "Submit a dunk for a cast",
};

export default function DunkPage() {
  return (
    <div className="bg-white text-black min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Dunk</h1>
          <p className="text-lg text-muted-foreground">
            Share your dunk on a cast
          </p>
        </div>
        <DunkForm />
      </div>
    </div>
  );
}

