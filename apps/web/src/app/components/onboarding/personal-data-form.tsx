"use client";

import {
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { FormSection } from "@/app/components/ui/form-section";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import {
  createEmptyPersonalDataDraft,
  loadPersonalDataDraft,
  profileGoalOptions,
  savePersonalDataDraft,
  type PersonalDataDraft,
} from "@/lib/onboarding/personal-data";
import {
  normalizePersonalData,
  validatePersonalData,
  type PersonalDataErrors,
} from "@/lib/onboarding/validate-personal-data";

export function PersonalDataForm() {
  const router = useRouter();

  const [draft, setDraft] = useState<PersonalDataDraft>(
      () => {
        if (typeof window === "undefined") {
          return createEmptyPersonalDataDraft();
        }

        return loadPersonalDataDraft();
      },
  );

  const [errors, setErrors] =
      useState<PersonalDataErrors>({});

  const updateField = <TField extends keyof PersonalDataDraft>(
    field: TField,
    value: PersonalDataDraft[TField],
  ): void => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const validationErrors = validatePersonalData(draft);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const normalizedDraft = normalizePersonalData(draft);

    savePersonalDataDraft(normalizedDraft);
    router.push("/onboarding/health");
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <FormSection
        title="Personal information"
        description="Tell us a little about yourself so Your Shadow can prepare suitable daily guidance."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            name="firstName"
            autoComplete="given-name"
            maxLength={100}
            value={draft.firstName}
            error={errors.firstName}
            
            onChange={(event) => updateField("firstName", event.target.value)}
          />

          <Input
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            maxLength={100}
            value={draft.lastName}
            error={errors.lastName}
            
            onChange={(event) => updateField("lastName", event.target.value)}
          />
        </div>

        <Input
          label="Display name"
          name="userName"
          autoComplete="nickname"
          maxLength={50}
          value={draft.userName}
          error={errors.userName}
          hint="This is the name Your Shadow will use when speaking to you."
          
          onChange={(event) => updateField("userName", event.target.value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            value={draft.dateOfBirth}
            error={errors.dateOfBirth}
            
            onChange={(event) => updateField("dateOfBirth", event.target.value)}
          />

          <Input
            label="Height"
            name="heightCm"
            type="number"
            inputMode="decimal"
            min={100}
            max={250}
            step={0.1}
            value={draft.heightCm}
            error={errors.heightCm}
            hint="Enter your height in centimetres."
            
            onChange={(event) => updateField("heightCm", event.target.value)}
          />
        </div>

        <Input
          label="Time zone"
          name="timezone"
          value={draft.timezone}
          error={errors.timezone}
          hint="Detected automatically. You can change it if necessary."
          
          onChange={(event) => updateField("timezone", event.target.value)}
        />
      </FormSection>

      <FormSection
        title="Your goal"
        description="These values help us personalise your starting plan."
      >
        <Select
            label="Primary goal"
            name="primaryGoal"
            value={draft.primaryGoal}
            options={profileGoalOptions}
            error={errors.primaryGoal}
            onChange={(event) =>
                updateField(
                    "primaryGoal",
                    event.target
                        .value as PersonalDataDraft["primaryGoal"],
                )
            }
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Current weight"
            name="currentWeightKg"
            type="number"
            inputMode="decimal"
            min={30}
            max={500}
            step={0.01}
            value={draft.currentWeightKg}
            error={errors.currentWeightKg}
            hint="Enter your current weight in kilograms."
            
            onChange={(event) =>
              updateField("currentWeightKg", event.target.value)
            }
          />

          <Input
            label="Target weight"
            name="targetWeightKg"
            type="number"
            inputMode="decimal"
            min={30}
            max={500}
            step={0.01}
            value={draft.targetWeightKg}
            error={errors.targetWeightKg}
            hint="Optional. Enter your target in kilograms."
            
            onChange={(event) =>
              updateField("targetWeightKg", event.target.value)
            }
          />
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="w-full sm:w-auto sm:min-w-40"
          
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
