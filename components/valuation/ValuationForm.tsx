'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useId, useState } from 'react';

import { useI18n } from '@/components/i18n/LanguageProvider';
import Link from 'next/link';
import {
  CONDITIONS,
  CONDOMINIUM_OPTIONS,
  CONTEXTS,
  ENERGY_CLASSES,
  EXTERNAL_FEATURES,
  FLOORS,
  GARDEN_OPTIONS,
  HEATINGS,
  INITIAL_VALUATION,
  OCCUPANCY_STATUSES,
  PROPERTY_TYPES,
  ROOMS,
  STEP_COUNT,
  validateStep,
  type Errors,
  type Option,
  type ValuationData,
} from '@/lib/valuation';
import { buildValuationMessage, buildWhatsAppUrl } from '@/lib/valuationMessage';
import FormStep from './FormStep';
import MultiSelectOption from './MultiSelectOption';
import OptionCard from './OptionCard';
import ProgressIndicator from './ProgressIndicator';
import ValuationSummary from './ValuationSummary';
import styles from './ValuationForm.module.css';

type Phase = number | 'summary';

const OBJECTIVE_FROM_INTENT: Record<string, ValuationData['objective']> = {
  vendere: 'vendere',
  affittare: 'affittare',
};

export default function ValuationForm() {
  const { t } = useI18n();
  const params = useSearchParams();
  const uid = useId();

  const presetObjective = OBJECTIVE_FROM_INTENT[params.get('intent') ?? ''] ?? '';

  const [data, setData] = useState<ValuationData>({
    ...INITIAL_VALUATION,
    objective: presetObjective,
  });
  const [phase, setPhase] = useState<Phase>(1);
  const [errors, setErrors] = useState<Errors>({});

  const update = useCallback(
    <K extends keyof ValuationData>(key: K, value: ValuationData[K]) => {
      setData((d) => {
        const next: ValuationData = { ...d, [key]: value };
        if (key === 'condominium' && value === 'no') {
          next.condominiumFees = '';
          next.condominiumFeesUnknown = false;
        }
        if (key === 'garden' && value !== 'privato' && value !== 'condominiale') {
          next.gardenSurface = '';
          next.gardenSurfaceUnknown = false;
        }
        if (key === 'constructionYearUnknown' && value === true) next.constructionYear = '';
        if (key === 'gardenSurfaceUnknown' && value === true) next.gardenSurface = '';
        if (key === 'condominiumFeesUnknown' && value === true) next.condominiumFees = '';
        if (key === 'heating' && value !== 'altro') next.heatingOther = '';
        if (key === 'propertyType' && value !== 'altro') next.propertyTypeOther = '';
        if (key === 'context' && value !== 'altro') next.contextOther = '';
        return next;
      });
      setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    },
    []
  );

  const toggleFeature = (value: string) => {
    setData((d) => {
      if (value === 'nessuna') {
        return { ...d, externalFeatures: d.externalFeatures.includes('nessuna') ? [] : ['nessuna'] };
      }
      const withoutNessuna = d.externalFeatures.filter((f) => f !== 'nessuna');
      const has = withoutNessuna.includes(value);
      return {
        ...d,
        externalFeatures: has ? withoutNessuna.filter((f) => f !== value) : [...withoutNessuna, value],
      };
    });
  };

  const goNext = () => {
    if (typeof phase !== 'number') return;
    const found = validateStep(phase, data, t.valuation.errors as unknown as Record<string, string>);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setPhase(phase < STEP_COUNT ? phase + 1 : 'summary');
  };

  const goBack = () => {
    if (phase === 'summary') {
      setPhase(STEP_COUNT);
      return;
    }
    if (typeof phase === 'number' && phase > 1) setPhase(phase - 1);
  };

  const sendWhatsApp = () => {
    const message = buildValuationMessage(data, t);
    window.location.href = buildWhatsAppUrl(message);
  };

  /** Solo presenza dei campi obbligatori: gli errori di formato restano al submit. */
  const canContinue = (() => {
    switch (phase) {
      case 1:
        return (
          data.address.trim() !== '' &&
          data.propertyType !== '' &&
          (data.propertyType !== 'altro' || data.propertyTypeOther.trim() !== '')
        );
      case 2:
        return data.surface.trim() !== '';
      case 4:
        return data.condition !== '';
      case 6:
        return data.objective !== '';
      case 7:
        return (
          data.firstName.trim() !== '' &&
          data.lastName.trim() !== '' &&
          data.phone.trim() !== '' &&
          data.privacyAccepted
        );
      default:
        return true;
    }
  })();

  const chipGroup = (
    options: Option[],
    field: keyof ValuationData,
    groupName: string
  ) => (
    <div className={styles.chips} role="radiogroup">
      {options.map((opt) => (
        <OptionCard
          key={opt.value}
          option={opt}
          name={groupName}
          selected={data[field] === opt.value}
          onSelect={() => update(field, opt.value as never)}
          t={t}
        />
      ))}
    </div>
  );

  const isSummary = phase === 'summary';

  return (
    <section className={`${styles.wrap} surface-light`} id="questionario" aria-labelledby={`${uid}-q`}>
      <div className="container">
        <div className={styles.shell}>
          {!isSummary && <ProgressIndicator step={phase as number} t={t} />}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
          >
            {isSummary ? (
              <ValuationSummary data={data} t={t} onEdit={goBack} onSend={sendWhatsApp} />
            ) : (
              <>
                {/* --------------------------------------------------- STEP 1 -- */}
                {phase === 1 && (
                  <FormStep step={1} title={t.valuation.step1Title} body={t.valuation.step1Body}>
                    <div className={styles.inlineField}>
                      <label className="field-label" htmlFor={`${uid}-address`}>
                        {t.valuation.addressLabel}
                      </label>
                      <input
                        id={`${uid}-address`}
                        className="field"
                        value={data.address}
                        onChange={(e) => update('address', e.target.value)}
                        placeholder={t.valuation.addressPlaceholder}
                        autoComplete="street-address"
                        aria-invalid={Boolean(errors.address)}
                        aria-describedby={errors.address ? `${uid}-address-err` : undefined}
                      />
                      {errors.address && (
                        <p className="field-error" id={`${uid}-address-err`}>
                          {errors.address}
                        </p>
                      )}
                      <p className={styles.hint}>{t.valuation.addressNote}</p>
                    </div>

                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.propertyTypeLabel}</p>
                      {chipGroup(PROPERTY_TYPES, 'propertyType', `${uid}-propertyType`)}
                      {errors.propertyType && <p className="field-error">{errors.propertyType}</p>}

                      {data.propertyType === 'altro' && (
                        <div className={styles.inlineField}>
                          <label className="field-label" htmlFor={`${uid}-propertyTypeOther`}>
                            {t.valuation.specify}
                          </label>
                          <input
                            id={`${uid}-propertyTypeOther`}
                            className="field"
                            value={data.propertyTypeOther}
                            onChange={(e) => update('propertyTypeOther', e.target.value)}
                            aria-invalid={Boolean(errors.propertyTypeOther)}
                          />
                          {errors.propertyTypeOther && (
                            <p className="field-error">{errors.propertyTypeOther}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </FormStep>
                )}

                {/* --------------------------------------------------- STEP 2 -- */}
                {phase === 2 && (
                  <FormStep step={2} title={t.valuation.step2Title}>
                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.floorLabel}</p>
                      {chipGroup(FLOORS, 'floor', `${uid}-floor`)}
                    </div>

                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.contextLabel}</p>
                      {chipGroup(CONTEXTS, 'context', `${uid}-context`)}

                      {data.context === 'altro' && (
                        <div className={styles.inlineField}>
                          <label className="field-label" htmlFor={`${uid}-contextOther`}>
                            {t.valuation.specifyContext}
                          </label>
                          <input
                            id={`${uid}-contextOther`}
                            className="field"
                            value={data.contextOther}
                            onChange={(e) => update('contextOther', e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.condominiumLabel}</p>
                      {chipGroup(CONDOMINIUM_OPTIONS, 'condominium', `${uid}-condominium`)}
                    </div>

                    <div className={`${styles.inlineField} ${styles.suffixField}`}>
                      <label className="field-label" htmlFor={`${uid}-surface`}>
                        {t.valuation.surfaceLabel}
                      </label>
                      <input
                        id={`${uid}-surface`}
                        className="field"
                        inputMode="numeric"
                        value={data.surface}
                        onChange={(e) => update('surface', e.target.value)}
                        placeholder={t.valuation.surfacePlaceholder}
                        aria-invalid={Boolean(errors.surface)}
                      />
                      <span className={styles.suffix} aria-hidden="true">m²</span>
                      {errors.surface && <p className="field-error">{errors.surface}</p>}
                    </div>

                    <div className={styles.inlineField}>
                      <label className="field-label" htmlFor={`${uid}-year`}>
                        {t.valuation.constructionYearLabel}
                      </label>
                      <input
                        id={`${uid}-year`}
                        className="field"
                        inputMode="numeric"
                        value={data.constructionYear}
                        onChange={(e) => update('constructionYear', e.target.value)}
                        placeholder={t.valuation.constructionYearPlaceholder}
                        disabled={data.constructionYearUnknown}
                      />
                      <label className={styles.unknownToggle}>
                        <input
                          type="checkbox"
                          checked={data.constructionYearUnknown}
                          onChange={(e) => update('constructionYearUnknown', e.target.checked)}
                        />
                        {t.valuation.dontKnow}
                      </label>
                    </div>

                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.roomsLabel}</p>
                      {chipGroup(ROOMS, 'rooms', `${uid}-rooms`)}
                    </div>
                  </FormStep>
                )}

                {/* --------------------------------------------------- STEP 3 -- */}
                {phase === 3 && (
                  <FormStep step={3} title={t.valuation.step3Title}>
                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.featuresLabel}</p>
                      <div className={styles.chips}>
                        {EXTERNAL_FEATURES.map((opt) => (
                          <MultiSelectOption
                            key={opt.value}
                            option={opt}
                            selected={data.externalFeatures.includes(opt.value)}
                            onToggle={() => toggleFeature(opt.value)}
                            t={t}
                          />
                        ))}
                      </div>
                    </div>

                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.gardenLabel}</p>
                      {chipGroup(GARDEN_OPTIONS, 'garden', `${uid}-garden`)}

                      {(data.garden === 'privato' || data.garden === 'condominiale') && (
                        <div className={`${styles.inlineField} ${styles.suffixField}`} style={{ marginTop: '0.5rem' }}>
                          <label className="field-label" htmlFor={`${uid}-gardenSurface`}>
                            {t.valuation.gardenSurfaceLabel}{' '}
                            <span className="optional">{t.valuation.optional}</span>
                          </label>
                          <input
                            id={`${uid}-gardenSurface`}
                            className="field"
                            inputMode="numeric"
                            value={data.gardenSurface}
                            onChange={(e) => update('gardenSurface', e.target.value)}
                            disabled={data.gardenSurfaceUnknown}
                          />
                          <span className={styles.suffix} aria-hidden="true">m²</span>
                          <label className={styles.unknownToggle}>
                            <input
                              type="checkbox"
                              checked={data.gardenSurfaceUnknown}
                              onChange={(e) => update('gardenSurfaceUnknown', e.target.checked)}
                            />
                            {t.valuation.dontKnow}
                          </label>
                        </div>
                      )}
                    </div>
                  </FormStep>
                )}

                {/* --------------------------------------------------- STEP 4 -- */}
                {phase === 4 && (
                  <FormStep step={4} title={t.valuation.step4Title}>
                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.conditionLabel}</p>
                      {chipGroup(CONDITIONS, 'condition', `${uid}-condition`)}
                      {errors.condition && <p className="field-error">{errors.condition}</p>}
                    </div>

                    <div className={styles.group}>
                      <p className={styles.groupLabel}>
                        {t.valuation.energyClassLabel} <span className="optional">{t.valuation.optional}</span>
                      </p>
                      {chipGroup(ENERGY_CLASSES, 'energyClass', `${uid}-energyClass`)}
                    </div>

                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.heatingLabel}</p>
                      {chipGroup(HEATINGS, 'heating', `${uid}-heating`)}

                      {data.heating === 'altro' && (
                        <div className={styles.inlineField}>
                          <label className="field-label" htmlFor={`${uid}-heatingOther`}>
                            {t.valuation.specifyHeating}
                          </label>
                          <input
                            id={`${uid}-heatingOther`}
                            className="field"
                            value={data.heatingOther}
                            onChange={(e) => update('heatingOther', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </FormStep>
                )}

                {/* --------------------------------------------------- STEP 5 -- */}
                {phase === 5 && (
                  <FormStep step={5} title={t.valuation.step5Title}>
                    <div className={styles.group}>
                      <p className={styles.groupLabel}>{t.valuation.occupancyLabel}</p>
                      {chipGroup(OCCUPANCY_STATUSES, 'occupancyStatus', `${uid}-occupancy`)}
                    </div>

                    {data.condominium === 'si' && (
                      <div className={`${styles.inlineField} ${styles.prefixField} ${styles.suffixField}`}>
                        <label className="field-label" htmlFor={`${uid}-fees`}>
                          {t.valuation.condominiumFeesLabel}
                        </label>
                        <input
                          id={`${uid}-fees`}
                          className="field"
                          inputMode="numeric"
                          value={data.condominiumFees}
                          onChange={(e) => update('condominiumFees', e.target.value)}
                          placeholder={t.valuation.condominiumFeesPlaceholder}
                          disabled={data.condominiumFeesUnknown}
                        />
                        <span className={styles.prefix} aria-hidden="true">€</span>
                        <span className={styles.suffix} aria-hidden="true">{t.valuation.perMonth}</span>
                        <label className={styles.unknownToggle}>
                          <input
                            type="checkbox"
                            checked={data.condominiumFeesUnknown}
                            onChange={(e) => update('condominiumFeesUnknown', e.target.checked)}
                          />
                          {t.valuation.dontKnow}
                        </label>
                      </div>
                    )}
                  </FormStep>
                )}

                {/* --------------------------------------------------- STEP 6 -- */}
                {phase === 6 && (
                  <FormStep step={6} title={t.valuation.step6Title}>
                    <div className={styles.objectiveGrid} role="radiogroup" aria-label={t.valuation.objectiveLabel}>
                      <label className={styles.objectiveCard}>
                        <input
                          type="radio"
                          name={`${uid}-objective`}
                          checked={data.objective === 'vendere'}
                          onChange={() => update('objective', 'vendere')}
                        />
                        <p className={styles.objectiveTitle}>{t.valuation.sellCardTitle}</p>
                        <p className={styles.objectiveBody}>{t.valuation.sellCardBody}</p>
                      </label>

                      <label className={styles.objectiveCard}>
                        <input
                          type="radio"
                          name={`${uid}-objective`}
                          checked={data.objective === 'affittare'}
                          onChange={() => update('objective', 'affittare')}
                        />
                        <p className={styles.objectiveTitle}>{t.valuation.rentCardTitle}</p>
                        <p className={styles.objectiveBody}>{t.valuation.rentCardBody}</p>
                      </label>

                      <label className={`${styles.objectiveCard} ${styles.objectiveWide}`}>
                        <input
                          type="radio"
                          name={`${uid}-objective`}
                          checked={data.objective === 'entrambe'}
                          onChange={() => update('objective', 'entrambe')}
                        />
                        <p className={styles.objectiveTitle}>{t.valuation.bothCardTitle}</p>
                      </label>
                    </div>
                    {errors.objective && <p className="field-error">{errors.objective}</p>}
                  </FormStep>
                )}

                {/* --------------------------------------------------- STEP 7 -- */}
                {phase === 7 && (
                  <FormStep step={7} title={t.valuation.step7Title} body={t.valuation.step7Body}>
                    <div className={`${styles.fieldGrid} ${styles.fieldGrid2}`}>
                      <div className={styles.inlineField}>
                        <label className="field-label" htmlFor={`${uid}-firstName`}>
                          {t.valuation.firstNameLabel}
                        </label>
                        <input
                          id={`${uid}-firstName`}
                          className="field"
                          value={data.firstName}
                          onChange={(e) => update('firstName', e.target.value)}
                          autoComplete="given-name"
                          aria-invalid={Boolean(errors.firstName)}
                        />
                        {errors.firstName && <p className="field-error">{errors.firstName}</p>}
                      </div>

                      <div className={styles.inlineField}>
                        <label className="field-label" htmlFor={`${uid}-lastName`}>
                          {t.valuation.lastNameLabel}
                        </label>
                        <input
                          id={`${uid}-lastName`}
                          className="field"
                          value={data.lastName}
                          onChange={(e) => update('lastName', e.target.value)}
                          autoComplete="family-name"
                          aria-invalid={Boolean(errors.lastName)}
                        />
                        {errors.lastName && <p className="field-error">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className={styles.inlineField}>
                      <label className="field-label" htmlFor={`${uid}-phone`}>
                        {t.valuation.phoneLabel}
                      </label>
                      <input
                        id={`${uid}-phone`}
                        className="field"
                        type="tel"
                        inputMode="tel"
                        value={data.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.phone)}
                      />
                      {errors.phone && <p className="field-error">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className={styles.consent}>
                        <input
                          type="checkbox"
                          checked={data.privacyAccepted}
                          onChange={(e) => update('privacyAccepted', e.target.checked)}
                          aria-invalid={Boolean(errors.privacyAccepted)}
                        />
                        <span className={styles.consentText}>
                          {t.valuation.privacyBefore}
                          <Link href="/privacy-policy">{t.valuation.privacyLink}</Link>
                          {t.valuation.privacyAfter}
                        </span>
                      </label>
                      {errors.privacyAccepted && <p className="field-error">{errors.privacyAccepted}</p>}
                    </div>
                  </FormStep>
                )}

                <div className={`${styles.nav} ${styles.navSticky}`}>
                  <button
                    type="button"
                    className={styles.back}
                    onClick={goBack}
                    hidden={phase === 1}
                  >
                    <span aria-hidden="true">←</span> {t.valuation.back}
                  </button>

                  <button type="submit" className={`btn ${styles.next}`} disabled={!canContinue}>
                    {t.valuation.continueCta}
                    <span className="arrow" aria-hidden="true">→</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
