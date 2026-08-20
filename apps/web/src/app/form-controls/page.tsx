import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { FormSection } from "@/app/components/ui/form-section";
import { Input } from "@/app/components/ui/input";
import { Scale } from "@/app/components/ui/scale";
import { Select } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";

export default function FormControlsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
          UI Foundation
        </p>

        <h1 className="mt-3 text-3xl font-bold">Form controls</h1>
      </div>

      <FormSection
        title="Example form"
        description="Reusable controls and their validation states."
      >
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          hint="We will use this address to sign you in."
        />

        <Input
          label="Password"
          type="password"
          error="Password must contain at least 8 characters."
        />

        <Textarea
          label="Your goal"
          placeholder="Describe what you want to improve."
        />

        <Select
          label="Primary goal"
          options={[
            { label: "Build healthier habits", value: "habits" },
            { label: "Improve nutrition", value: "nutrition" },
            { label: "Move more often", value: "movement" },
          ]}
        />

        <Scale label="How is your energy today?" defaultValue={5} />

        <Checkbox
          label="I understand that Your Shadow does not provide medical advice."
          error="You must confirm this before continuing."
        />

        <div className="flex flex-wrap gap-3">
          <Button>Continue</Button>
          <Button variant="secondary">Cancel</Button>
          <Button loading>Saving</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </FormSection>
    </main>
  );
}
