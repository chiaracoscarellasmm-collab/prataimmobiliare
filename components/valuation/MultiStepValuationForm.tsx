'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { useI18n } from '@/components/i18n/LanguageProvider';
import { interpolate, labelOf } from '@/data/i18n';
import { submitValuation } from '@/lib/submitValuation';
import {
  CONDITIONS,
  CONTACT_PREFERENCES,
  ENERGY_CLASSES,
  FEATURES,
  INITIAL_VALUATION,
  OCCUPANCY,
  PROPERTY_TYPES,
  TIMELINES,
  validateStep,
  type Errors,
  type ValuationData,
} from '@/lib/valuation';
import styles from './MultiStepValuationForm.module.css';

const TOTAL = 5;

type Props = {
  /** Preselection coming from the two routes above, or from the USAF page. */
  initialIntent?: ValuationData['intent'];
  initialTarget?: ValuationData['target'];
};

export default function MultiStepValuationForm({
  initialIntent = '',
  initialTarget = '',
}: Props) {
  const { t } = useI18n();
  const opt = (value: string) =>
    labelOf(t.valuation.options as Record<string, string>, value);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ValuationData>({
    ...INITIAL_VALUATION,
    intent: initialIntent,
    target: initialTarget,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  /* Answers arriving from another page should not be lost. */
  useEffect(() => {
    setData((d) => ({ ...d, intent: initialIntent || d.intent, target: initialTarget || d.target }));
  }, [initialIntent, initialTarget]);

  /* Move focus to the new question, but never steal it on first paint. */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, done]);

  const update = useCallback(<K extends keyof ValuationData>(key: K, value: ValuationData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const toggleFeature = (feature: string) =>
    setData((d) => ({
      ...d,
      features: d.features.includes(feature)
        ? d.features.filter((f) => f !== feature)
        : [...d.features, feature],
    }));

  const goNext = async () => {
    const found = validateStep(step, data, t.valuation.errors);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const result = await submitValuation(data);
    setSubmitting(false);

    // Never claim success the backend did not confirm.
    if (result.ok) setDone(true);
    else setFormError(t.valuation.submit[result.code]);
  };

  const goBack = () => {
    setFormError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setData((d) => ({ ...d, photos: [...d.photos, ...images].slice(0, 12) }));
  };

  if (done) {
    return (
      <section className={styles.wrap} id="questionario">
        <div className="container">
          <div className={`${styles.shell} ${styles.success}`}>
            <h2 className={styles.successTitle} tabIndex={-1} ref={headingRef}>
              {t.valuation.thanksTitle}
              <br />
              {t.valuation.thanksSubtitle}
            </h2>
            <p className="lead">{t.valuation.thanksBody}</p>
            <Link href="/" className="arrow-link">
              <span>{t.valuation.backHome}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------- render -- */
  const radioGroup = (
    field: keyof ValuationData,
    options: string[],
    values?: string[]
  ) => (
    <div className={styles.choices} role="radiogroup" aria-labelledby={`${uid}-q`}>
      {options.map((option, i) => {
        const value = values ? values[i] : option;
        return (
          <label key={option} className={styles.choice}>
            <input
              type="radio"
              name={`${uid}-${String(field)}`}
              value={value}
              checked={data[field] === value}
              onChange={() => update(field, value as never)}
            />
            <span className={styles.choiceLabel}>{opt(option)}</span>
            <span className={styles.choiceMark} aria-hidden="true" />
          </label>
        );
      })}
    </div>
  );

  const chipGroup = (field: keyof ValuationData, options: string[]) => (
    <div className={styles.chips}>
      {options.map((option) => (
        <label key={option} className={styles.chip}>
          <input
            type="radio"
            name={`${uid}-${String(field)}`}
            value={option}
            checked={data[field] === option}
            onChange={() => update(field, option as never)}
          />
            <span>{opt(option)}</span>
        </label>
      ))}
    </div>
  );

  return (
    <section className={styles.wrap} id="questionario" aria-labelledby={`${uid}-q`}>
      <div className="container">
        <div className={styles.shell} ref={shellRef}>
          <div className={styles.progressRow}>
            <p className={styles.stepCount}>
              {interpolate(t.valuation.stepOf, { current: step + 1, total: TOTAL })}
            </p>
            <p className={styles.stepName}>{t.valuation.steps[step]}</p>
          </div>
          <div
            className={styles.track}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-valuenow={step + 1}
            aria-label={t.valuation.progress}
          >
            <span
              className={styles.bar}
              style={{ transform: `scaleX(${(step + 1) / TOTAL})` }}
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void goNext();
            }}
          >
            <div key={step} className={`${styles.step} ${styles.stepEnter}`}>
              {/* ------------------------------------------------ STEP 1 -- */}
              {step === 0 && (
                <>
                  <h2 id={`${uid}-q`} className={styles.question} tabIndex={-1} ref={headingRef}>
                    {t.valuation.q0}
                  </h2>
                  {radioGroup('intent', [t.valuation.sell, t.valuation.rent], ['vendere', 'affittare'])}
                  {errors.intent && <p className="field-error">{errors.intent}</p>}
                </>
              )}

              {/* ------------------------------------------------ STEP 2 -- */}
              {step === 1 && (
                <>
                  <h2 id={`${uid}-q`} className={styles.question} tabIndex={-1} ref={headingRef}>
                    {t.valuation.q1}
                  </h2>

                  <div className={styles.group}>
                    <p className={styles.groupLabel}>{t.valuation.type}</p>
                    {chipGroup('propertyType', PROPERTY_TYPES)}
                    {errors.propertyType && <p className="field-error">{errors.propertyType}</p>}
                  </div>

                  <div className={styles.fieldGrid}>
                    <div>
                      <label className="field-label" htmlFor={`${uid}-location`}>
                        {t.valuation.location}
                      </label>
                      <input
                        id={`${uid}-location`}
                        className="field"
                        value={data.location}
                        onChange={(e) => update('location', e.target.value)}
                        autoComplete="address-level2"
                        aria-invalid={Boolean(errors.location)}
                        aria-describedby={errors.location ? `${uid}-location-err` : undefined}
                      />
                      {errors.location && (
                        <p className="field-error" id={`${uid}-location-err`}>
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="field-label" htmlFor={`${uid}-address`}>
                        {t.valuation.address}{' '}
                        <span className="optional">{t.valuation.optional}</span>
                      </label>
                      <input
                        id={`${uid}-address`}
                        className="field"
                        value={data.address}
                        onChange={(e) => update('address', e.target.value)}
                        autoComplete="street-address"
                      />
                    </div>

                    <div>
                      <label className="field-label" htmlFor={`${uid}-surface`}>
                        {t.valuation.surface}
                      </label>
                      <input
                        id={`${uid}-surface`}
                        className="field"
                        inputMode="numeric"
                        value={data.surface}
                        onChange={(e) => update('surface', e.target.value)}
                        aria-invalid={Boolean(errors.surface)}
                      />
                      {errors.surface && <p className="field-error">{errors.surface}</p>}
                    </div>

                    <div className={styles.fieldGrid} style={{ gap: '1rem' }}>
                      <div>
                        <label className="field-label" htmlFor={`${uid}-bedrooms`}>
                          {t.valuation.bedrooms}
                        </label>
                        <input
                          id={`${uid}-bedrooms`}
                          className="field"
                          inputMode="numeric"
                          value={data.bedrooms}
                          onChange={(e) => update('bedrooms', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor={`${uid}-bathrooms`}>
                          {t.valuation.bathrooms}
                        </label>
                        <input
                          id={`${uid}-bathrooms`}
                          className="field"
                          inputMode="numeric"
                          value={data.bathrooms}
                          onChange={(e) => update('bathrooms', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <fieldset className={styles.group} style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend className={styles.groupLabel}>
                      {t.valuation.features}{' '}
                      <span className="optional">{t.valuation.optional}</span>
                    </legend>
                    <div className={styles.chips} style={{ marginTop: '0.75rem' }}>
                      {FEATURES.map((feature) => (
                        <label key={feature} className={styles.chip}>
                          <input
                            type="checkbox"
                            checked={data.features.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                          />
                          <span>{opt(feature)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              {/* ------------------------------------------------ STEP 3 -- */}
              {step === 2 && (
                <>
                  <h2 id={`${uid}-q`} className={styles.question} tabIndex={-1} ref={headingRef}>
                    {t.valuation.q2}
                  </h2>

                  <div className={styles.group}>
                    <p className={styles.groupLabel}>{t.valuation.condition}</p>
                    {chipGroup('condition', CONDITIONS)}
                    {errors.condition && <p className="field-error">{errors.condition}</p>}
                  </div>

                  <p className={styles.hint}>{t.valuation.hint}</p>

                  <div className={`${styles.fieldGrid} ${styles.fieldGrid3}`}>
                    <div>
                      <label className="field-label" htmlFor={`${uid}-built`}>
                        {t.valuation.built} <span className="optional">{t.valuation.optional}</span>
                      </label>
                      <input
                        id={`${uid}-built`}
                        className="field"
                        inputMode="numeric"
                        placeholder={t.valuation.dontKnow}
                        value={data.constructionYear}
                        onChange={(e) => update('constructionYear', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`${uid}-renov`}>
                        {t.valuation.renovated}{' '}
                        <span className="optional">{t.valuation.optional}</span>
                      </label>
                      <input
                        id={`${uid}-renov`}
                        className="field"
                        inputMode="numeric"
                        placeholder={t.valuation.dontKnow}
                        value={data.renovationYear}
                        onChange={(e) => update('renovationYear', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`${uid}-energy`}>
                        {t.valuation.energy} <span className="optional">{t.valuation.optional}</span>
                      </label>
                      <select
                        id={`${uid}-energy`}
                        className="field"
                        value={data.energyClass}
                        onChange={(e) => update('energyClass', e.target.value)}
                      >
                        <option value="">{t.valuation.select}</option>
                        {ENERGY_CLASSES.map((c) => (
                          <option key={c} value={c}>
                            {opt(c)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.group}>
                    <p className={styles.groupLabel}>
                      {t.valuation.occupancy} <span className="optional">{t.valuation.optional}</span>
                    </p>
                    {chipGroup('occupancy', OCCUPANCY)}
                  </div>
                </>
              )}

              {/* ------------------------------------------------ STEP 4 -- */}
              {step === 3 && (
                <>
                  <h2 id={`${uid}-q`} className={styles.question} tabIndex={-1} ref={headingRef}>
                    {t.valuation.q3}
                  </h2>
                  {radioGroup('timeline', TIMELINES)}
                  {errors.timeline && <p className="field-error">{errors.timeline}</p>}

                  <div className={styles.group}>
                    <p className={styles.groupLabel}>
                      {t.valuation.photos} <span className="optional">{t.valuation.optional}</span>
                    </p>
                    <p className={styles.hint}>{t.valuation.photosHint}</p>

                    <div
                      className={`${styles.upload} ${dragOver ? styles.uploadOver : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        addFiles(e.dataTransfer.files);
                      }}
                    >
                      <label className={styles.uploadCta} htmlFor={`${uid}-photos`}>
                        {t.valuation.choosePhotos}
                      </label>
                      <input
                        id={`${uid}-photos`}
                        className={styles.uploadInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => addFiles(e.target.files)}
                      />
                      <p className={styles.hint}>{t.valuation.drop}</p>

                      {data.photos.length > 0 && (
                        <ul className={styles.fileList}>
                          {data.photos.map((file, i) => (
                            <li key={`${file.name}-${i}`} className={styles.file}>
                              <span>{file.name}</span>
                              <button
                                type="button"
                                className={styles.fileRemove}
                                onClick={() =>
                                  setData((d) => ({
                                    ...d,
                                    photos: d.photos.filter((_, j) => j !== i),
                                  }))
                                }
                              >
                                {t.valuation.remove}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ------------------------------------------------ STEP 5 -- */}
              {step === 4 && (
                <>
                  <h2 id={`${uid}-q`} className={styles.question} tabIndex={-1} ref={headingRef}>
                    {t.valuation.q4}
                  </h2>

                  <div className={styles.fieldGrid}>
                    <div className="span2">
                      <label className="field-label" htmlFor={`${uid}-name`}>
                        {t.valuation.name}
                      </label>
                      <input
                        id={`${uid}-name`}
                        className="field"
                        value={data.name}
                        onChange={(e) => update('name', e.target.value)}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="field-label" htmlFor={`${uid}-phone`}>
                        {t.valuation.phone}
                      </label>
                      <input
                        id={`${uid}-phone`}
                        className="field"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.phone)}
                      />
                      {errors.phone && <p className="field-error">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="field-label" htmlFor={`${uid}-email`}>
                        {t.valuation.email}
                      </label>
                      <input
                        id={`${uid}-email`}
                        className="field"
                        type="email"
                        value={data.email}
                        onChange={(e) => update('email', e.target.value)}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>
                  </div>

                  <div className={styles.group}>
                    <p className={styles.groupLabel}>
                      {t.valuation.preference}{' '}
                      <span className="optional">{t.valuation.optional}</span>
                    </p>
                    {chipGroup('contactPreference', CONTACT_PREFERENCES)}
                  </div>

                  <div>
                    <label className="field-label" htmlFor={`${uid}-notes`}>
                      {t.valuation.notes} <span className="optional">{t.valuation.optional}</span>
                    </label>
                    <textarea
                      id={`${uid}-notes`}
                      className="field"
                      rows={3}
                      value={data.notes}
                      onChange={(e) => update('notes', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={styles.consent}>
                      <input
                        type="checkbox"
                        checked={data.privacyConsent}
                        onChange={(e) => update('privacyConsent', e.target.checked)}
                        aria-invalid={Boolean(errors.privacyConsent)}
                      />
                      <span className={styles.consentText}>
                        {t.valuation.consentBefore}
                        <Link href="/privacy-policy">{t.nav.privacy}</Link>
                        {t.valuation.consentAfter}
                      </span>
                    </label>
                    {errors.privacyConsent && (
                      <p className="field-error">{errors.privacyConsent}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className={styles.nav}>
              <button type="button" className={styles.back} onClick={goBack} hidden={step === 0}>
                <span aria-hidden="true">←</span> {t.valuation.back}
              </button>

              <button type="submit" className={`btn ${styles.next}`} disabled={submitting}>
                {step < TOTAL - 1
                  ? t.valuation.continue
                  : submitting
                    ? t.valuation.sending
                    : t.valuation.send}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </button>

              {formError && (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
