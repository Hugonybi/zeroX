import clsx from "clsx";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { SelectField } from "../components/ui/SelectField";
import { TextArea } from "../components/ui/TextArea";
import { TextField } from "../components/ui/TextField";

type StepId = "details" | "media" | "pricing";

type ArtworkFormState = {
  title: string;
  tagline: string;
  description: string;
  type: "digital" | "physical";
  category: string;
  dimensions: string;
  medium: string;
  editionSize: string;
  serialPrefix: string;
  fulfillment: string;
  shippingNotes: string;
  fileName: string;
  price: string;
  currency: string;
  inventory: string;
};

const steps: Array<{ id: StepId; title: string; blurb: string }> = [
  {
    id: "details",
    title: "Artwork details",
    blurb: "Tell collectors what makes this piece special and how it should be catalogued.",
  },
  {
    id: "media",
    title: "Media & editions",
    blurb: "Upload your primary asset, define edition counts, and set handling notes.",
  },
  {
    id: "pricing",
    title: "Pricing & launch",
    blurb: "Confirm the sale price, currency, and fulfillment readiness before publishing.",
  },
];

const categories = ["Painting", "Photography", "Digital", "Mixed Media", "Sculpture", "Installation"];
const currencies = [
  { code: "NGN", label: "₦ Nigerian Naira" },
  { code: "USD", label: "$ US Dollar" },
  { code: "GBP", label: "£ British Pound" },
  { code: "EUR", label: "€ Euro" },
];

const initialForm: ArtworkFormState = {
  title: "",
  tagline: "",
  description: "",
  type: "digital",
  category: "Digital",
  dimensions: "",
  medium: "",
  editionSize: "1",
  serialPrefix: "",
  fulfillment: "instant-download",
  shippingNotes: "",
  fileName: "",
  price: "",
  currency: "NGN",
  inventory: "1",
};

export function ArtistsPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [formState, setFormState] = useState<ArtworkFormState>(initialForm);
  const [assetPreviewUrl, setAssetPreviewUrl] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (assetPreviewUrl) {
        URL.revokeObjectURL(assetPreviewUrl);
      }
    };
  }, [assetPreviewUrl]);

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
    setHasSubmitted(false);
  };

  const handleClassificationChange = (nextType: ArtworkFormState["type"]) => {
    setFormState((previous) => ({
      ...previous,
      type: nextType,
      fulfillment: nextType === "digital" ? "instant-download" : "studio-shipment",
    }));
    setHasSubmitted(false);
  };

  const handleAssetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFormState((previous) => ({ ...previous, fileName: file.name }));

    setAssetPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      return URL.createObjectURL(file);
    });
    setHasSubmitted(false);
    event.target.value = "";
  };

  const clearAsset = () => {
    setFormState((previous) => ({ ...previous, fileName: "" }));
    setAssetPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return null;
    });
    setHasSubmitted(false);
  };

  const currentStep = steps[activeStepIndex];

  const isDetailsValid =
    Boolean(formState.title.trim()) &&
    Boolean(formState.description.trim()) &&
    Boolean(formState.category.trim()) &&
    Boolean(formState.type);

  const editionSizeNumber = Number(formState.editionSize);
  const inventoryNumber = Number(formState.inventory);
  const priceNumber = Number(formState.price);

  const isMediaValid = Boolean(formState.fileName) && Number.isFinite(editionSizeNumber) && editionSizeNumber >= 1;

  const isPricingValid =
    Number.isFinite(priceNumber) &&
    priceNumber > 0 &&
    Boolean(formState.currency) &&
    Number.isFinite(inventoryNumber) &&
    inventoryNumber >= 1;

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep.id) {
      case "details":
        return isDetailsValid;
      case "media":
        return isMediaValid;
      case "pricing":
        return isPricingValid;
      default:
        return false;
    }
  }, [currentStep.id, isDetailsValid, isMediaValid, isPricingValid]);

  const goToStep = (nextIndex: number) => {
    setActiveStepIndex(nextIndex);
    setHasSubmitted(false);
  };

  const goNext = () => {
    if (activeStepIndex === steps.length - 1 || !isCurrentStepValid) {
      return;
    }
    setActiveStepIndex((index) => index + 1);
  };

  const goPrevious = () => {
    if (activeStepIndex === 0) {
      return;
    }
    setActiveStepIndex((index) => index - 1);
    setHasSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isPricingValid) {
      return;
    }

    setHasSubmitted(true);
    setActiveStepIndex(steps.length - 1);
  };

  const progressPercentage = hasSubmitted
    ? 100
    : Math.round((activeStepIndex / (steps.length - 1)) * 100);

  const displayTitle = formState.title || "Untitled artwork";
  const displayPrice = formState.price ? `${formState.currency} ${formState.price}` : "Set a price";

  const classificationOptions: Array<{
    value: ArtworkFormState["type"];
    title: string;
    description: string;
  }> = [
    {
      value: "digital",
      title: "Digital asset",
      description: "Mint and deliver certificate instantly. Buyers receive files at payment confirmation.",
    },
    {
      value: "physical",
      title: "Physical piece",
      description: "Fabricated or hand-made works. Certificate mints once studio confirms shipment.",
    },
  ];

  return (
    <section className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Artist workspace</p>
          <h2 className="font-brand text-4xl uppercase tracking-[0.15em]">Post a new artwork</h2>
          <p className="max-w-2xl text-sm text-ink-muted">
            Walk through the steps to stage a listing, attach mint-ready assets, and configure fulfillment preferences.
            You can revisit any section before publishing to collectors.
          </p>
        </header>

        {hasSubmitted && (
          <div className="rounded-3xl border border-mint-dark/30 bg-mint-soft px-6 py-4 text-sm text-ink">
            <p className="font-semibold uppercase tracking-[0.2em] text-mint-dark">Listing saved</p>
            <p className="mt-1 text-xs text-ink-muted">
              Your artwork is staged for review. Connect the backend action to push live and trigger Hedera minting after payment.
            </p>
          </div>
        )}

        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const status = index < activeStepIndex || hasSubmitted ? "done" : index === activeStepIndex ? "active" : "idle";

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={clsx(
                    "rounded-3xl border p-5 text-left transition-all duration-300",
                    status === "done" && "border-mint-dark bg-mint-soft",
                    status === "active" && "border-ink bg-white shadow-brand",
                    status === "idle" && "border-charcoal/15 bg-white hover:border-ink/40"
                  )}
                >
                  <span className="flex items-center gap-3 text-xs uppercase tracking-[0.35em]">
                    <span
                      className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                        status === "done" && "border-mint-dark bg-mint-dark/10 text-mint-dark",
                        status === "active" && "border-ink text-ink",
                        status === "idle" && "border-charcoal/20 text-ink/50"
                      )}
                    >
                      {status === "done" ? "✓" : index + 1}
                    </span>
                    {step.title}
                  </span>
                  <p className="mt-4 text-sm text-ink-muted">{step.blurb}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-brand">
            {currentStep.id === "details" && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Artwork title</span>
                    <TextField
                      name="title"
                      value={formState.title}
                      placeholder="e.g. Chromatic Memory"
                      onChange={handleFieldChange}
                      maxLength={80}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Tagline (optional)</span>
                    <TextField
                      name="tagline"
                      value={formState.tagline}
                      placeholder="A short note for collectors"
                      onChange={handleFieldChange}
                      maxLength={120}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.35em] text-ink">Description</span>
                  <TextArea
                    name="description"
                    value={formState.description}
                    placeholder="Share the story, technique, and any provenance notes."
                    onChange={handleFieldChange}
                    rows={5}
                  />
                </label>

                <div className="grid gap-6 lg:grid-cols-2">
                  <fieldset className="space-y-3">
                    <legend className="text-xs uppercase tracking-[0.35em] text-ink">Classification</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {classificationOptions.map((option) => {
                        const isActive = formState.type === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleClassificationChange(option.value)}
                            className={clsx(
                              "h-full rounded-3xl border px-5 py-4 text-left transition-all duration-300",
                              isActive
                                ? "border-mint-dark bg-mint-soft text-ink"
                                : "border-charcoal/15 bg-white text-ink hover:border-ink/40"
                            )}
                          >
                            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-ink">
                              {option.title}
                            </span>
                            <span className="mt-3 block text-sm text-ink-muted">{option.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="space-y-4">
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.35em] text-ink">Category</span>
                      <SelectField name="category" value={formState.category} onChange={handleFieldChange}>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </SelectField>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.35em] text-ink">Dimensions (optional)</span>
                      <TextField
                        name="dimensions"
                        value={formState.dimensions}
                        placeholder="e.g. 50cm × 70cm"
                        onChange={handleFieldChange}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.35em] text-ink">Medium (optional)</span>
                      <TextField
                        name="medium"
                        value={formState.medium}
                        placeholder="Oil on canvas, digital collage..."
                        onChange={handleFieldChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep.id === "media" && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-[0.35em] text-ink">Primary media upload</span>
                  <div className="relative flex min-h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-charcoal/20 bg-white px-6 py-12 text-center">
                    {assetPreviewUrl ? (
                      <img src={assetPreviewUrl} alt="Selected artwork preview" className="h-56 w-full rounded-2xl object-cover" />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-ink">Drag & drop or browse</p>
                        <p className="text-sm text-ink-muted">
                          Upload a high-resolution image, video, or PDF. Max 150MB. IPFS pinning executes post payment.
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*,application/pdf"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={handleAssetChange}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>
                      {formState.fileName ? `Selected: ${formState.fileName}` : "No asset selected yet"}
                    </span>
                    {formState.fileName && (
                      <button type="button" onClick={clearAsset} className="uppercase tracking-[0.35em] text-ink hover:text-mint-dark">
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Edition size</span>
                    <TextField
                      type="number"
                      min={1}
                      name="editionSize"
                      value={formState.editionSize}
                      onChange={handleFieldChange}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Serial prefix (optional)</span>
                    <TextField
                      name="serialPrefix"
                      value={formState.serialPrefix}
                      placeholder="e.g. CM-2025"
                      onChange={handleFieldChange}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Fulfillment</span>
                    <SelectField name="fulfillment" value={formState.fulfillment} onChange={handleFieldChange}>
                      <option value="instant-download">Instant download (digital delivery)</option>
                      <option value="studio-shipment">Ships from studio (physical)</option>
                      <option value="external-link">External fulfillment partner</option>
                    </SelectField>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Handling notes (optional)</span>
                    <TextArea
                      name="shippingNotes"
                      value={formState.shippingNotes}
                      placeholder="Packaging, lead times, or special collector instructions."
                      onChange={handleFieldChange}
                      rows={3}
                    />
                  </label>
                </div>
              </div>
            )}

            {currentStep.id === "pricing" && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-[1fr_auto]">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Price</span>
                    <TextField
                      type="number"
                      min={0}
                      step="0.01"
                      name="price"
                      value={formState.price}
                      placeholder="e.g. 950000"
                      onChange={handleFieldChange}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-ink">Currency</span>
                    <SelectField name="currency" value={formState.currency} onChange={handleFieldChange}>
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.label}
                        </option>
                      ))}
                    </SelectField>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.35em] text-ink">Inventory available</span>
                  <TextField
                    type="number"
                    min={1}
                    name="inventory"
                    value={formState.inventory}
                    onChange={handleFieldChange}
                  />
                </label>

                <div className="space-y-4 rounded-3xl bg-charcoal/5 p-6 text-sm text-ink">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-xs uppercase tracking-[0.35em] text-ink">Minting</span>
                    <p className="text-ink-muted">
                      Hedera authenticity tokens generate automatically after we receive a paid webhook. Ensure the artwork metadata is final;
                      mint retries are handled in the admin console if adjustments are needed later.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-xs uppercase tracking-[0.35em] text-ink">Payouts</span>
                    <p className="text-ink-muted">
                      Payouts settle to your linked bank account within 3 business days. Platform fees and payment processing are netted automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="sm" onClick={goPrevious} disabled={activeStepIndex === 0}>
              Back
            </Button>
            {currentStep.id === "pricing" ? (
              <Button type="submit" disabled={!isCurrentStepValid || hasSubmitted}>
                {hasSubmitted ? "Listing saved" : "Publish listing"}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} disabled={!isCurrentStepValid}>
                Continue
              </Button>
            )}
          </div>
        </form>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-charcoal/10 bg-white p-6 shadow-brand">
          <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Progress</p>
          <div className="mt-4 h-2 w-full rounded-full bg-charcoal/10">
            <div className="h-full rounded-full bg-mint" style={{ width: `${progressPercentage}%` }} aria-hidden="true" />
          </div>
          <ul className="mt-6 space-y-4 text-sm">
            {steps.map((step, index) => {
              const status = index < activeStepIndex || hasSubmitted ? "done" : index === activeStepIndex ? "active" : "idle";
              return (
                <li key={step.id} className="flex items-start gap-3">
                  <span
                    className={clsx(
                      "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      status === "done" && "bg-mint text-ink",
                      status === "active" && "border border-ink text-ink",
                      status === "idle" && "border border-charcoal/20 text-ink/50"
                    )}
                  >
                    {status === "done" ? "✓" : index + 1}
                  </span>
                  <div>
                    <p className="uppercase tracking-[0.35em] text-xs text-ink">{step.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">{status === "done" ? "Complete" : status === "active" ? "In progress" : "Pending"}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl border border-charcoal/10 bg-white shadow-brand">
          <div className="overflow-hidden rounded-t-3xl bg-charcoal/5">
            {assetPreviewUrl ? (
              <img src={assetPreviewUrl} alt="Artwork preview" className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center bg-linear-to-br from-sky-soft via-mint-soft to-white text-xs uppercase tracking-[0.35em] text-ink/50">
                Preview coming soon
              </div>
            )}
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Listing preview</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{displayTitle}</h3>
              <p className="text-sm text-ink-muted">{formState.tagline || formState.category}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="uppercase tracking-[0.35em] text-ink">{formState.type}</span>
              <span className="font-semibold text-ink">{displayPrice}</span>
            </div>
            <div className="rounded-2xl bg-charcoal/5 px-4 py-3 text-xs text-ink">
              <p className="uppercase tracking-[0.35em] text-ink-muted">After purchase</p>
              <p className="mt-1 text-ink-muted">
                Order status switches to processing, authenticity token mints, and collectors receive a certificate page.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
