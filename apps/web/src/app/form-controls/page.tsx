import { Bell, Save, Trash2 } from "lucide-react";
import { ThemeSwitcher } from "@/app/components/theme/theme-switcher";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { FormSection } from "@/app/components/ui/form-section";
import { IconButton } from "@/app/components/ui/icon-button";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/password-input";
import { Scale } from "@/app/components/ui/scale";
import { Select } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";

const goalOptions = [
  { label: "Build healthier habits", value: "habits" },
  { label: "Improve nutrition", value: "nutrition" },
  { label: "Move more often", value: "movement" },
];

export default function FormControlsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-semibold tracking-[0.18em] text-primary-content uppercase">
          UI foundation
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Form controls
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Shared controls preserve labels, validation, keyboard focus and
          minimum target sizes in both themes.
        </p>
      </header>

      <FormSection
        title="Buttons and actions"
        description="Primary, secondary, quiet, destructive, loading and icon-only states."
      >
        <div className="flex flex-wrap gap-3">
          <Button>
            <Save aria-hidden="true" className="size-4" />
            Save changes
          </Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="quiet">Not now</Button>
          <Button loading loadingLabel="Saving...">
            Save changes
          </Button>
          <Button disabled>Unavailable</Button>
          <Button variant="danger">
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <IconButton label="View notifications">
            <Bell aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label="Save example" variant="quiet">
            <Save aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label="Delete example" variant="danger">
            <Trash2 aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label="Loading action" loading>
            <Save aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label="Disabled action" disabled>
            <Bell aria-hidden="true" className="size-5" />
          </IconButton>
        </div>
      </FormSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <FormSection
          title="Text fields"
          description="Default, invalid, read-only, disabled and password states."
        >
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            hint="We use this address to sign you in."
          />

          <Input
            label="Invalid email"
            type="email"
            defaultValue="not-an-email"
            error="Enter a valid email address."
          />

          <Input
            label="Account identifier"
            defaultValue="YS-2048"
            hint="Read-only values remain legible."
            readOnly
          />

          <Input
            label="Unavailable field"
            defaultValue="Disabled value"
            disabled
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            hint="Use the accessible reveal control to inspect the value."
            defaultValue="example-password"
          />
        </FormSection>

        <FormSection
          title="Choices and longer input"
          description="Native controls retain keyboard behavior and visible values."
        >
          <Select
            label="Primary goal"
            options={goalOptions}
            hint="Choose one starting priority."
          />

          <Select
            label="Invalid selection"
            options={goalOptions}
            error="Choose your primary goal."
          />

          <Textarea
            label="Optional note"
            placeholder="Add context without sharing more than needed."
            hint="Up to 1,000 characters."
          />

          <Textarea
            label="Saved note"
            defaultValue="This note is shown as a read-only example."
            readOnly
          />

          <Scale
            label="Example energy"
            min={1}
            max={10}
            defaultValue={6}
            hint="Use the arrow keys to change the value."
          />

          <Checkbox
            label="I understand that Your Shadow does not provide medical advice."
            error="You must confirm this before continuing."
          />

          <Checkbox
            label="This option is unavailable."
            disabled
          />
        </FormSection>
      </div>

      <FormSection
        title="Theme preference"
        description="A segmented control is used because Light, Dark and System are three real choices."
        variant="muted"
      >
        <div className="max-w-md">
          <ThemeSwitcher />
        </div>
      </FormSection>

      <section aria-labelledby="card-examples-title">
        <h2 id="card-examples-title" className="text-2xl font-bold">
          Card surfaces
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <h3 className="font-semibold">Default</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Standard content surface.
            </p>
          </Card>
          <Card variant="muted">
            <h3 className="font-semibold">Muted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Quiet grouped content.
            </p>
          </Card>
          <Card variant="raised">
            <h3 className="font-semibold">Raised</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Emphasized content surface.
            </p>
          </Card>
          <Card variant="destructive">
            <h3 className="font-semibold text-error-content">Destructive</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Reserved danger-zone surface.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
