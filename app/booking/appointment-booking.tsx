"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Check, Clock3 } from "lucide-react";
import { services } from "@/lib/landing-content";

type Service = (typeof services)[number];
type BookingField = "service" | "date" | "time" | "name" | "phone" | "email" | "specialRequests";
type BookingErrors = Partial<Record<BookingField, string>>;
type BookingConfirmation = { serviceName: string; date: string; time: string; name: string; reference: string };

const timeSlots = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

function formatSelectedDate(value: string) {
  if (!value) return "Not selected";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${value}T12:00:00Z`));
}

function indiaDateInputValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function AppointmentBooking() {
  const [today, setToday] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState("");
  const [errors, setErrors] = useState<BookingErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const fieldRefs = useRef<Partial<Record<BookingField, HTMLElement | null>>>({});

  useEffect(() => {
    // Keep the date input's initial value client-local and avoid a server/client timezone mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(indiaDateInputValue(new Date()));
  }, []);

  const clearError = (field: BookingField) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError("");
  };

  const validate = () => {
    const next: BookingErrors = {};
    const todayValue = indiaDateInputValue(new Date());

    if (!selectedService) next.service = "Choose a service to continue.";
    if (!selectedDate) next.date = "Choose a date for your appointment request.";
    else if (selectedDate < todayValue) next.date = "Choose today or a future date.";
    if (!selectedTime) next.time = "Choose an appointment time.";
    if (fullName.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(phone)) next.phone = "Enter a valid 10-digit Indian mobile number.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address or leave this field blank.";
    if (requests.trim().length > 1000) next.specialRequests = "Special requests must be 1,000 characters or fewer.";

    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalidField = Object.keys(nextErrors)[0] as BookingField;
      setFormError(nextErrors[firstInvalidField] ?? "Please correct the highlighted field.");
      requestAnimationFrame(() => {
        const target = fieldRefs.current[firstInvalidField];
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.focus();
      });
      return;
    }

    if (!selectedService) return;
    setErrors({});
    setFormError("");
    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: selectedService.name, date: selectedDate, time: selectedTime, name: fullName.trim(), phone, email, specialRequests: requests }),
      });
      const result: { error?: string; fields?: Partial<Record<BookingField, string>>; bookingReference?: string } = await response.json();
      if (!response.ok) {
        if (result.fields) {
          setErrors(result.fields);
          const firstInvalidField = Object.keys(result.fields)[0] as BookingField | undefined;
          if (firstInvalidField) {
            setFormError(result.fields[firstInvalidField] ?? result.error ?? "Please correct the highlighted field.");
            requestAnimationFrame(() => {
              const target = fieldRefs.current[firstInvalidField];
              target?.scrollIntoView({ behavior: "smooth", block: "center" });
              target?.focus();
            });
            return;
          }
        }
        setFormError(result.error ?? "We could not submit your request. Please try again.");
        return;
      }
      setConfirmation({
        serviceName: selectedService.name,
        date: formatSelectedDate(selectedDate),
        time: selectedTime,
        name: fullName.trim(),
        reference: result.bookingReference ?? "Received",
      });
    } catch {
      setFormError("We could not reach the appointment service. Please try again later.");
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmation(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setFullName("");
    setPhone("");
    setEmail("");
    setRequests("");
    setErrors({});
    setFormError("");
  };

  if (confirmation) {
    return (
      <div className="booking-content-wrap">
        <header className="booking-page-intro" data-reveal>
          <div className="booking-intro-copy">
            <p className="eyebrow">APPOINTMENTS AT SANGAM</p>
            <h1>Your visit, <em>at a glance.</em></h1>
            <p>A little time for yourself, a more beautiful you.</p>
          </div>
          <div className="booking-intro-image"><Image src="/images/salon-hero.jpg" alt="A welcoming view inside Sangam Parlour" fill priority sizes="(max-width: 760px) 100vw, 42vw" /></div>
        </header>
        <section className="booking-confirmation" aria-labelledby="booking-confirmation-title" data-reveal>
          <div className="booking-confirmation-mark" aria-hidden="true"><Check size={24} strokeWidth={1.7}/></div>
          <p className="eyebrow">REQUEST RECEIVED</p>
          <h2 id="booking-confirmation-title">Your request is with the salon</h2>
          <p className="booking-confirmation-note">Your appointment is pending. The salon will contact you to confirm the time.</p>
          <dl className="booking-confirmation-details">
            <div><dt>REFERENCE</dt><dd>{confirmation.reference}</dd></div>
            <div><dt>NAME</dt><dd>{confirmation.name}</dd></div>
            <div><dt>SERVICE</dt><dd>{confirmation.serviceName}</dd></div>
            <div><dt>DATE</dt><dd>{confirmation.date}</dd></div>
            <div><dt>TIME</dt><dd>{confirmation.time}</dd></div>
          </dl>
          <button className="booking-secondary-button" type="button" onClick={resetForm}>Make another request</button>
        </section>
      </div>
    );
  }

  const displayedPrice = selectedService && "price" in selectedService ? String(selectedService.price) : "";

  return (
    <div className="booking-content-wrap">
      <header className="booking-page-intro" data-reveal>
        <div className="booking-intro-copy">
          <p className="eyebrow">APPOINTMENTS AT SANGAM</p>
          <h1>Book Your <em>Appointment</em></h1>
          <p>A little time for yourself, a more beautiful you.</p>
        </div>
        <div className="booking-intro-image"><Image src="/images/salon-hero.jpg" alt="A welcoming view inside Sangam Parlour" fill priority sizes="(max-width: 760px) 100vw, 42vw" /></div>
      </header>

      <form className="booking-layout" onSubmit={handleSubmit} noValidate>
        <aside className="booking-summary" aria-labelledby="booking-summary-title">
          <p className="eyebrow">YOUR VISIT</p>
          <h2 id="booking-summary-title">Booking summary</h2>
          <dl className="booking-summary-list">
            <div><dt>SERVICE</dt><dd>{selectedService?.name ?? "Choose a service"}</dd></div>
            <div><dt>DATE</dt><dd>{formatSelectedDate(selectedDate)}</dd></div>
            <div><dt>TIME</dt><dd>{selectedTime || "Not selected"}</dd></div>
            {displayedPrice && <div><dt>PRICE</dt><dd>{displayedPrice}</dd></div>}
          </dl>
          <p className="booking-summary-disclaimer">Requests are pending until the salon confirms them. A time already requested cannot be submitted again.</p>
        </aside>

        <div className="booking-form-steps">
          <section className="booking-step" aria-labelledby="booking-service-title" data-reveal>
            <div className="booking-step-heading">
              <span className="booking-step-number">01</span>
              <div><h2 id="booking-service-title">Choose a service</h2><p>Select the experience you have in mind.</p></div>
            </div>
            <div className="booking-service-grid" role="group" aria-labelledby="booking-service-title">
              {services.map((service) => {
                const selected = selectedService?.number === service.number;
                return (
                  <button
                    key={service.number}
                    type="button"
                    className={`booking-service-card${selected ? " is-selected" : ""}`}
                    aria-pressed={selected}
                    ref={(element) => { if (service.number === "01") fieldRefs.current.service = element; }}
                    onClick={() => { setSelectedService(service); clearError("service"); }}
                  >
                    <span className="booking-service-image"><Image src={service.photo.src} alt={service.photo.alt} fill sizes="(max-width: 620px) 88vw, (max-width: 980px) 40vw, 34vw" /></span>
                    <span className="booking-service-copy">
                      <span className="booking-service-title-row"><strong>{service.name}</strong>{selected && <Check size={15} aria-hidden="true"/>}</span>
                      <span>{service.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.service && <p className="booking-field-error" role="alert">{errors.service}</p>}
          </section>

          <section className="booking-step" aria-labelledby="booking-date-title" data-reveal>
            <div className="booking-step-heading">
              <span className="booking-step-number">02</span>
              <div><h2 id="booking-date-title">Select date and time</h2><p>Choose a preferred date and time for your request.</p></div>
            </div>
            <label className="booking-date-field" htmlFor="appointment-date">
              <span className="booking-label">PREFERRED DATE</span>
              <span className="booking-input-with-icon">
                <CalendarDays size={17} aria-hidden="true"/>
                <input ref={(element) => { fieldRefs.current.date = element; }} id="appointment-date" type="date" min={today || undefined} value={selectedDate} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "appointment-date-error" : "appointment-date-help"} onChange={(event) => { setSelectedDate(event.target.value); clearError("date"); }} />
              </span>
            </label>
            {errors.date ? <p className="booking-field-error" id="appointment-date-error" role="alert">{errors.date}</p> : <p className="booking-field-help" id="appointment-date-help">Past dates are not accepted. The salon will confirm your request.</p>}

            <div className="booking-time-heading"><span className="booking-label">PREFERRED TIME</span><span className="booking-demo-tag"><Clock3 size={13} aria-hidden="true"/> REQUEST</span></div>
              <div className="booking-time-grid" role="group" aria-label="Preferred appointment times">
              {timeSlots.map((time, index) => <button ref={index === 0 ? (element) => { fieldRefs.current.time = element; } : undefined} className={`booking-time-option${selectedTime === time ? " is-selected" : ""}`} key={time} type="button" aria-pressed={selectedTime === time} onClick={() => { setSelectedTime(time); clearError("time"); }}>{time}</button>)}
            </div>
            <p className="booking-field-help">Choose a preferred time. The salon’s hours and service durations need confirmation; your request remains pending.</p>
            {errors.time && <p className="booking-field-error" role="alert">{errors.time}</p>}
          </section>

          <section className="booking-step booking-customer-step" aria-labelledby="booking-customer-title" data-reveal>
            <div className="booking-step-heading">
              <span className="booking-step-number">03</span>
              <div><h2 id="booking-customer-title">Your details</h2><p>Share how the salon can reach you about your request.</p></div>
            </div>
            <div className="booking-fields-grid">
              <div className="booking-field">
                <label className="booking-label" htmlFor="customer-name">FULL NAME <span aria-hidden="true">*</span></label>
                <input ref={(element) => { fieldRefs.current.name = element; }} className="booking-text-input" id="customer-name" type="text" autoComplete="name" value={fullName} aria-required="true" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "customer-name-error" : undefined} onChange={(event) => { setFullName(event.target.value); clearError("name"); }} />
                {errors.name && <p className="booking-field-error" id="customer-name-error" role="alert">{errors.name}</p>}
              </div>
              <div className="booking-field">
                <label className="booking-label" htmlFor="customer-phone">PHONE NUMBER <span aria-hidden="true">*</span></label>
                <div className={`booking-phone-input${errors.phone ? " has-error" : ""}`}>
                  <span aria-hidden="true">+91</span>
                  <input ref={(element) => { fieldRefs.current.phone = element; }} id="customer-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" maxLength={10} value={phone} aria-required="true" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "customer-phone-error" : "customer-phone-help"} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, "").slice(0, 10)); clearError("phone"); }} />
                </div>
                {errors.phone ? <p className="booking-field-error" id="customer-phone-error" role="alert">{errors.phone}</p> : <p className="booking-field-help" id="customer-phone-help">Enter a 10-digit Indian mobile number.</p>}
              </div>
              <div className="booking-field">
                <label className="booking-label" htmlFor="customer-email">EMAIL <span>OPTIONAL</span></label>
                <input ref={(element) => { fieldRefs.current.email = element; }} className="booking-text-input" id="customer-email" type="email" autoComplete="email" value={email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "customer-email-error" : undefined} onChange={(event) => { setEmail(event.target.value); clearError("email"); }} />
                {errors.email && <p className="booking-field-error" id="customer-email-error" role="alert">{errors.email}</p>}
              </div>
              <div className="booking-field booking-field-wide">
                <label className="booking-label" htmlFor="customer-request">SPECIAL REQUESTS <span>OPTIONAL</span></label>
                <textarea ref={(element) => { fieldRefs.current.specialRequests = element; }} className="booking-text-input booking-textarea" id="customer-request" rows={3} value={requests} aria-invalid={Boolean(errors.specialRequests)} aria-describedby={errors.specialRequests ? "customer-request-error" : undefined} onChange={(event) => { setRequests(event.target.value); clearError("specialRequests"); }} />
                {errors.specialRequests && <p className="booking-field-error" id="customer-request-error" role="alert">{errors.specialRequests}</p>}
              </div>
            </div>
          </section>
          {formError && <p className="booking-form-error" role="alert">{formError}</p>}
          <div className="booking-summary-actions">
            <button className="booking-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <>Sending request <span className="booking-loading-dot" aria-hidden="true"/></> : <>Submit Appointment Request <ArrowRight size={16} aria-hidden="true"/> </>}
            </button>
            <p className="booking-summary-footnote">Your request is pending until confirmed by the salon</p>
          </div>
        </div>
      </form>
    </div>
  );
}
