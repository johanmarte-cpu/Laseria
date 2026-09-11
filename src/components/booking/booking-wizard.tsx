"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { BookingProgress } from "@/components/booking/progress";
import { StepTreatment } from "@/components/booking/steps/step-treatment";
import { StepProfessional } from "@/components/booking/steps/step-professional";
import { StepDate } from "@/components/booking/steps/step-date";
import { StepTime } from "@/components/booking/steps/step-time";
import { StepCustomer } from "@/components/booking/steps/step-customer";
import { StepConfirm } from "@/components/booking/steps/step-confirm";
import { STEPS, type CustomerPrefill, type WizardProfessional, type WizardService } from "@/components/booking/types";
import { FIRST_AVAILABLE_ID } from "@/lib/constants";
import type { CustomerInfoInput } from "@/lib/validations";

const EMPTY_CUSTOMER: CustomerInfoInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  notes: "",
  wantsReminders: false,
};

export function BookingWizard({
  services,
  professionals,
  prefillCustomer,
  isLoggedIn,
  initialServiceId,
  initialCategory,
}: {
  services: WizardService[];
  professionals: WizardProfessional[];
  prefillCustomer: CustomerPrefill | null;
  isLoggedIn: boolean;
  initialServiceId?: string;
  initialCategory?: string;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialServiceId && services.some((s) => s.id === initialServiceId) ? [initialServiceId] : []
  );
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [customerData, setCustomerData] = useState<CustomerInfoInput>(
    prefillCustomer
      ? {
          firstName: prefillCustomer.firstName,
          lastName: prefillCustomer.lastName,
          email: prefillCustomer.email,
          phone: prefillCustomer.phone,
          birthDate: prefillCustomer.birthDate,
          notes: "",
          wantsReminders: prefillCustomer.marketingOptIn,
        }
      : EMPTY_CUSTOMER
  );
  const [customerValid, setCustomerValid] = useState(isLoggedIn);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const selectedProfessional =
    professionalId && professionalId !== FIRST_AVAILABLE_ID
      ? (professionals.find((p) => p.id === professionalId) ?? null)
      : null;

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setDate(null);
    setTime(null);
  }

  function selectProfessional(id: string) {
    setProfessionalId(id);
    setDate(null);
    setTime(null);
  }

  function selectDate(d: string) {
    setDate(d);
    setTime(null);
  }

  const canGoNext = [
    selectedServiceIds.length > 0,
    professionalId !== null,
    date !== null,
    time !== null,
    customerValid,
  ][stepIndex];

  function goNext() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }
  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function handleConfirm() {
    if (!professionalId || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceIds: selectedServiceIds,
          professionalId,
          date,
          startTime: time,
          customer: customerData,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setSubmitError(body.error ?? "No pudimos confirmar tu cita. Intenta de nuevo.");
        setSubmitting(false);
        return;
      }

      if (body.tempCredentials) {
        await signIn("credentials", {
          email: body.tempCredentials.email,
          password: body.tempCredentials.password,
          redirect: false,
        }).catch(() => null);
      }

      router.push(`/reservar/confirmacion/${body.appointmentId}?bookingNumber=${body.bookingNumber}`);
    } catch {
      setSubmitError("No pudimos confirmar tu cita. Verifica tu conexión e intenta de nuevo.");
      setSubmitting(false);
    }
  }

  const step = STEPS[stepIndex].key;

  return (
    <Container className="max-w-2xl py-10 lg:py-16">
      <BookingProgress currentIndex={stepIndex} />

      <div className="mt-10 animate-fade-up" key={step}>
        {step === "treatment" && (
          <StepTreatment
            services={services}
            selectedIds={selectedServiceIds}
            onToggle={toggleService}
            initialCategory={initialCategory}
          />
        )}

        {step === "professional" && (
          <StepProfessional
            professionals={professionals}
            selectedId={professionalId}
            onSelect={selectProfessional}
          />
        )}

        {step === "date" && professionalId && (
          <StepDate
            professionalId={professionalId}
            durationMinutes={totalDuration}
            selectedDate={date}
            onSelect={selectDate}
          />
        )}

        {step === "time" && professionalId && date && (
          <StepTime
            professionalId={professionalId}
            date={date}
            durationMinutes={totalDuration}
            selectedTime={time}
            onSelect={setTime}
          />
        )}

        {step === "customer" && (
          <StepCustomer
            defaultValues={customerData}
            isLoggedIn={isLoggedIn}
            onValidChange={(valid, data) => {
              setCustomerValid(valid);
              setCustomerData(data);
            }}
          />
        )}

        {step === "confirm" && date && time && (
          <StepConfirm
            services={selectedServices}
            professional={selectedProfessional}
            date={date}
            time={time}
            customer={customerData}
            submitting={submitting}
            error={submitError}
            onConfirm={handleConfirm}
          />
        )}
      </div>

      {step !== "confirm" && (
        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            Atrás
          </Button>
          <Button onClick={goNext} disabled={!canGoNext}>
            Continuar
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      )}

      {step === "confirm" && (
        <div className="mt-4">
          <Button variant="ghost" onClick={goBack} disabled={submitting}>
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            Atrás
          </Button>
        </div>
      )}
    </Container>
  );
}
