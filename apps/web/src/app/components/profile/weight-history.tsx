"use client";

import {
    useState,
    type FormEvent,
} from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useWeightEntries } from "@/hooks/use-weight-entries";
import { getAuthErrorMessage } from "@/lib/api/auth-api";
import {
    createWeightEntry,
} from "@/lib/api/profile-api";

const formatMeasurementDate = (
    value: string,
): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return `${new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    }).format(date)} UTC`;
};

const validateWeight = (
    value: string,
): string | null => {
    const pattern = /^\d+(?:\.\d{1,2})?$/;
    const weightKg = Number(value);

    if (
        !pattern.test(value) ||
        weightKg < 30 ||
        weightKg > 500
    ) {
        return "Weight must be between 30 and 500 kg.";
    }

    return null;
};

export function WeightHistory() {
    const {
        weightEntries,
        error,
        isLoading,
        refreshWeightEntries,
    } = useWeightEntries();

    const [weightKg, setWeightKg] = useState("");
    const [weightError, setWeightError] = useState<
        string | null
    >(null);
    const [submitError, setSubmitError] = useState<
        string | null
    >(null);
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        setSubmitError(null);

        const validationError = validateWeight(weightKg);

        if (validationError !== null) {
            setWeightError(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            await createWeightEntry({
                weightKg: Number(weightKg),
            });

            await refreshWeightEntries();
            setWeightKg("");
            setWeightError(null);
        } catch (requestError: unknown) {
            setSubmitError(
                getAuthErrorMessage(requestError),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                    Loading weight history...
                </p>
            </section>
        );
    }

    if (error !== null) {
        return (
            <section className="rounded-lg border border-error bg-surface p-6 shadow-sm">
                <p className="text-error">{error.message}</p>

                <Button
                    type="button"
                    className="mt-4"
                    onClick={() => void refreshWeightEntries()}
                >
                    Try again
                </Button>
            </section>
        );
    }

    const latestEntry = weightEntries[0];

    return (
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="border-b border-border pb-5">
                <h2 className="text-xl font-semibold">
                    Weight history
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Every measurement is stored separately and does
                    not replace previous entries.
                </p>
            </div>

            <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
                <div>
                    {latestEntry ? (
                        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
                            <p className="text-sm font-medium text-muted-foreground">
                                Latest weight
                            </p>

                            <p className="mt-2 text-3xl font-bold">
                                {latestEntry.weightKg} kg
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {formatMeasurementDate(
                                    latestEntry.measuredAt,
                                )}
                            </p>
                        </div>
                    ) : null}

                    {weightEntries.length === 0 ? (
                        <p className="rounded-md border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                            No weight measurements have been added yet.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-border">
                            <div className="max-h-80 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-surface-muted">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">
                                            Date
                                        </th>

                                        <th className="px-4 py-3 text-right font-semibold">
                                            Weight
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-border">
                                    {weightEntries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatMeasurementDate(
                                                    entry.measuredAt,
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold">
                                                {entry.weightKg} kg
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <form
                    className="h-fit space-y-4 rounded-lg border border-border bg-surface-muted p-5"
                    onSubmit={(event) => void handleSubmit(event)}
                    noValidate
                >
                    <div>
                        <h3 className="font-semibold">
                            Add new measurement
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            The current date and time will be added
                            automatically.
                        </p>
                    </div>

                    <Input
                        label="Weight"
                        name="weightKg"
                        type="number"
                        inputMode="decimal"
                        min={30}
                        max={500}
                        step={0.01}
                        value={weightKg}
                        error={weightError ?? undefined}
                        hint="Weight in kilograms."
                        disabled={isSubmitting}
                        onChange={(event) => {
                            setWeightKg(event.target.value);
                            setWeightError(null);
                            setSubmitError(null);
                        }}
                    />

                    {submitError !== null ? (
                        <p
                            className="text-sm text-error"
                            role="alert"
                        >
                            {submitError}
                        </p>
                    ) : null}

                    <Button
                        type="submit"
                        loading={isSubmitting}
                        className="w-full"
                    >
                        Save measurement
                    </Button>
                </form>
            </div>
        </section>
    );
}