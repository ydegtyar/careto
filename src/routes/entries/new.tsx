import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import { type ExpenseParseResult, parseImageWithAi } from '@/features/ai/lib/ai-client';
import { ReceiptCapture } from '@/features/attachments/components/ReceiptCapture/ReceiptCapture';
import type { CompressedImage } from '@/features/attachments/lib/image-compressor';
import { compressAndPrepareImage } from '@/features/attachments/lib/image-compressor';
import { CategoryPicker } from '@/features/entries/components/CategoryPicker/CategoryPicker';
import { EntryDetailsLocationCard } from '@/features/entries/components/EntryDetailsLocationCard/EntryDetailsLocationCard';
import {
  type EntryKind,
  EntryKindSelector,
} from '@/features/entries/components/EntryKindSelector/EntryKindSelector';
import { FuelGradeSelector } from '@/features/entries/components/FuelGradeSelector/FuelGradeSelector';
import { HeroAmountPaymentCard } from '@/features/entries/components/HeroAmountPaymentCard/HeroAmountPaymentCard';
import { RecurringExpenseOptions } from '@/features/entries/components/RecurringExpenseOptions/RecurringExpenseOptions';
import {
  type EditableSubItem,
  SubItemsEditor,
} from '@/features/entries/components/SubItemsEditor/SubItemsEditor';
import {
  useLastPricesPerFuelGrade,
  useLastUsedFuelGrade,
} from '@/features/entries/lib/fuel-grade-storage';
import { entriesQueryOptions, vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import {
  convertToUsdMinor,
  useLastUsedCurrency,
  useLastUsedPaymentMethod,
} from '@/shared/lib/currencies';
import { clearSharedPayload, getLatestSharedPayload } from '@/shared/lib/share-target-db';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

interface NewEntrySearchParams {
  shared?: string;
  kind?: string;
}

export const Route = createFileRoute('/entries/new')({
  validateSearch: (search: Record<string, unknown>): NewEntrySearchParams => ({
    shared: typeof search.shared === 'string' ? search.shared : undefined,
    kind: typeof search.kind === 'string' ? search.kind : undefined,
  }),
  component: NewEntryPage,
});

function NewEntryPage() {
  const navigate = useNavigate({ from: Route.id });
  const searchParams = Route.useSearch();
  const { activeVehicleId } = useAppStore();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const tanks = activeVehicle?.tanks || [];

  const { data: entries = [] } = useQuery(entriesQueryOptions(activeVehicleId ?? undefined));

  const [lastUsedCurrency, setLastUsedCurrency] = useLastUsedCurrency();
  const [lastUsedPaymentMethod, _setLastUsedPaymentMethod] = useLastUsedPaymentMethod();
  const [lastUsedFuelGrade, setLastUsedFuelGrade] = useLastUsedFuelGrade();
  const [lastPricesPerGrade, setLastPricesPerGrade] = useLastPricesPerFuelGrade();

  const [selectedTankId, setSelectedTankId] = useState<string>(tanks[0]?.id || 'tank_1');
  const [kind, setKind] = useState<EntryKind>((searchParams.kind as EntryKind) || 'refuel');

  useEffect(() => {
    if (searchParams.kind && searchParams.kind !== kind) {
      setKind(searchParams.kind as EntryKind);
    }
  }, [searchParams.kind, kind]);
  const [category, setCategory] = useState<string>('fuel');
  const [fuelGrade, setFuelGrade] = useState<string>(lastUsedFuelGrade);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(lastUsedCurrency);

  // Sync currency with latest entry that has a currency set (falling back to lastUsedCurrency)
  useEffect(() => {
    const latestEntryWithCurrency = entries.find((e) => Boolean(e.currency));
    if (latestEntryWithCurrency?.currency) {
      setCurrency(latestEntryWithCurrency.currency);
    } else if (lastUsedCurrency) {
      setCurrency(lastUsedCurrency);
    }
  }, [entries, lastUsedCurrency]);
  const [odometerKm, setOdometerKm] = useState('');

  useEffect(() => {
    if (kind === 'note') return;
    const maxEntryOdo = entries.reduce(
      (max, e) => (e.odometer_m && e.odometer_m > max ? e.odometer_m : max),
      0,
    );
    const lastOdoM = maxEntryOdo || activeVehicle?.initial_odometer_m || 0;
    if (lastOdoM > 0) {
      setOdometerKm((lastOdoM / 1000).toString());
    }
  }, [entries, activeVehicle?.initial_odometer_m, kind]);

  const [volumeLiters, setVolumeLiters] = useState('45.2');
  const [pricePerUnit, setPricePerUnit] = useState<string>(
    lastPricesPerGrade[lastUsedFuelGrade] || '1.44',
  );
  const [isFullTank, setIsFullTank] = useState(true);
  const [date, setDate] = useState('2026-10-08');
  const [paymentMethod, setPaymentMethod] = useState(lastUsedPaymentMethod);

  // Sync payment method with latest entry that has a payment method set (falling back to lastUsedPaymentMethod)
  useEffect(() => {
    const latestEntryWithPaymentMethod = entries.find(
      (e) => Boolean((e as any).payment_method) || Boolean((e as any).payment_id),
    );
    const method =
      (latestEntryWithPaymentMethod as any)?.payment_method ||
      (latestEntryWithPaymentMethod as any)?.payment_id;
    if (method) {
      setPaymentMethod(method);
    } else if (lastUsedPaymentMethod) {
      setPaymentMethod(lastUsedPaymentMethod);
    }
  }, [entries, lastUsedPaymentMethod]);
  const [isBusiness, setIsBusiness] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('monthly');
  const [useSinkingFund, setUseSinkingFund] = useState(false);
  const [notes, setNotes] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorLocation, setVendorLocation] = useState('City Center Garage - Floor 2B');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [subItems, setSubItems] = useState<EditableSubItem[]>([]);
  const [_receiptImage, setReceiptImage] = useState<CompressedImage | null>(null);
  const [aiSummaryEnabled, setAiSummaryEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleImageReady = async (
    compressed: CompressedImage | null,
    originalFile?: File | Blob,
  ) => {
    setReceiptImage(compressed);
    if (!compressed || !aiSummaryEnabled) return;

    try {
      const fileToParse = originalFile || compressed.blob;
      const targetPurpose = kind === 'note' ? 'note' : 'expense';
      const res = await parseImageWithAi(targetPurpose, fileToParse);

      if (res.success && res.data) {
        const parsed = res.data;
        if (targetPurpose === 'note') {
          const noteData = parsed as any;
          if (noteData.notes)
            setNotes((prev) => (prev ? `${prev}\n${noteData.notes}` : noteData.notes));
          if (noteData.date) setDate(noteData.date);
          if (noteData.odometerKm) setOdometerKm(noteData.odometerKm.toString());
          if (noteData.merchant || noteData.vendorName) {
            setVendorName(noteData.vendorName || noteData.merchant || '');
            setVendorLocation(noteData.merchant || noteData.vendorName || '');
          }
          if (noteData.lat && noteData.lon) {
            setLat(noteData.lat);
            setLon(noteData.lon);
          }
        } else {
          const expenseData = parsed as ExpenseParseResult;
          if (expenseData.amount) handleAmountChange(expenseData.amount.toString());
          if (expenseData.date) setDate(expenseData.date);
          if (expenseData.fuelVolume) handleVolumeChange(expenseData.fuelVolume.toString());
          if (expenseData.category) setCategory(expenseData.category);
          if (expenseData.merchant || expenseData.vendorName) {
            setVendorName(expenseData.vendorName || expenseData.merchant || '');
            setVendorLocation(expenseData.merchant || expenseData.vendorName || '');
          }
          if (expenseData.lat && expenseData.lon) {
            setLat(expenseData.lat);
            setLon(expenseData.lon);
          }
          if (expenseData.notes) setNotes(expenseData.notes);
          if (expenseData.currency) handleCurrencyChange(expenseData.currency);
        }
      }
    } catch (err) {
      console.error('Failed to parse image with AI:', err);
    }
  };

  const effectiveTankId =
    tanks.length > 0 && !tanks.some((t) => t.id === selectedTankId) ? tanks[0]?.id : selectedTankId;

  const _effectiveFuelGrade = (() => {
    if (tanks.length > 0 && tanks[0]?.id === effectiveTankId && tanks[0]?.primary_fuel_grade) {
      return tanks[0]?.primary_fuel_grade;
    }
    if (
      activeVehicle?.fuel_grades &&
      activeVehicle.fuel_grades.length > 0 &&
      !activeVehicle.fuel_grades.includes(fuelGrade)
    ) {
      return activeVehicle.fuel_grades[0]!;
    }
    return fuelGrade;
  })();

  useEffect(() => {
    async function loadSharedData() {
      const payload = await getLatestSharedPayload();
      if (!payload) return;

      if (payload.text || payload.title || payload.url) {
        const sharedText = [payload.title, payload.text, payload.url].filter(Boolean).join(' ');
        setNotes((prev) => (prev ? `${prev}\n${sharedText}` : sharedText));

        const match = sharedText.match(/(\d+[.,]\d{2})/);
        if (match?.[1] && !amount) {
          setAmount(match[1].replace(',', '.'));
        }
      }

      if (payload.file) {
        try {
          const compressed = await compressAndPrepareImage(payload.file);
          await handleImageReady(compressed, payload.file);
        } catch (err) {
          console.error('Failed to process shared receipt image:', err);
        }
      }

      await clearSharedPayload(payload.id);
    }

    if (searchParams.shared || typeof window !== 'undefined') {
      loadSharedData();
    }
  }, [searchParams.shared, amount]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setLastUsedCurrency(newCurrency);
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const amtNum = parseFloat(val);
    const volNum = parseFloat(volumeLiters);
    const priceNum = parseFloat(pricePerUnit);

    if (!Number.isNaN(amtNum) && amtNum > 0) {
      if (!Number.isNaN(volNum) && volNum > 0) {
        setPricePerUnit((amtNum / volNum).toFixed(3));
      } else if (!Number.isNaN(priceNum) && priceNum > 0) {
        setVolumeLiters((amtNum / priceNum).toFixed(1));
      }
    }
  };

  const handleVolumeChange = (val: string) => {
    setVolumeLiters(val);
    const volNum = parseFloat(val);
    const priceNum = parseFloat(pricePerUnit);
    const amtNum = parseFloat(amount);

    if (!Number.isNaN(volNum) && volNum > 0) {
      if (!Number.isNaN(priceNum) && priceNum > 0) {
        setAmount((volNum * priceNum).toFixed(2));
      } else if (!Number.isNaN(amtNum) && amtNum > 0) {
        setPricePerUnit((amtNum / volNum).toFixed(3));
      }
    }
  };

  const handleFuelGradeChange = (newGrade: string) => {
    setFuelGrade(newGrade);
    setLastUsedFuelGrade(newGrade);
    const storedPrice = lastPricesPerGrade[newGrade];
    if (storedPrice) {
      setPricePerUnit(storedPrice);
      const priceNum = parseFloat(storedPrice);
      const volNum = parseFloat(volumeLiters);
      const amtNum = parseFloat(amount);
      if (!Number.isNaN(priceNum) && priceNum > 0) {
        if (!Number.isNaN(volNum) && volNum > 0) {
          setAmount((volNum * priceNum).toFixed(2));
        } else if (!Number.isNaN(amtNum) && amtNum > 0) {
          setVolumeLiters((amtNum / priceNum).toFixed(1));
        }
      }
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerUnit(val);
    if (fuelGrade) {
      setLastPricesPerGrade((prev) => ({
        ...prev,
        [fuelGrade]: val,
      }));
    }
    const priceNum = parseFloat(val);
    const volNum = parseFloat(volumeLiters);
    const amtNum = parseFloat(amount);

    if (!Number.isNaN(priceNum) && priceNum > 0) {
      if (!Number.isNaN(volNum) && volNum > 0) {
        setAmount((volNum * priceNum).toFixed(2));
      } else if (!Number.isNaN(amtNum) && amtNum > 0) {
        setVolumeLiters((amtNum / priceNum).toFixed(1));
      }
    }
  };

  const handleTankChange = (tankId: string) => {
    setSelectedTankId(tankId);
    const matchedTank = tanks.find((t) => t.id === tankId);
    if (matchedTank?.primary_fuel_grade) {
      handleFuelGradeChange(matchedTank.primary_fuel_grade);
    }
  };

  const selectedTank = tanks.find((t) => t.id === selectedTankId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const amountMinor = amount ? Math.round(parseFloat(amount) * 100) : undefined;
      const odoM = odometerKm ? Math.round(parseFloat(odometerKm) * 1000) : undefined;
      const usdMinor = amountMinor ? convertToUsdMinor(amountMinor, currency) : undefined;

      await data.upsertEntry({
        id: crypto.randomUUID(),
        kind,
        occurred_on: date,
        odometer_m: odoM,
        amount_minor: amountMinor,
        currency: amountMinor ? currency : undefined,
        usd_minor: usdMinor,
        business: isBusiness ? 1 : 0,
        vendor_name: vendorName || notes || undefined,
        lat: lat ?? undefined,
        lon: lon ?? undefined,
      });

      navigate({ to: '/garage' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Entry Kind Selector */}
        <EntryKindSelector
          value={kind}
          onChange={(newKind) => {
            setKind(newKind);
            if (newKind === 'refuel') setCategory('fuel');
            else if (newKind === 'service') setCategory('service');
            navigate({
              search: (prev) => ({ ...prev, kind: newKind }),
              replace: true,
            });
          }}
        />

        {/* Hero Amount & Payment Card — Hidden for Notes unless specified */}
        {kind !== 'note' && (
          <HeroAmountPaymentCard
            amount={amount}
            onAmountChange={handleAmountChange}
            currency={currency}
            onCurrencyChange={handleCurrencyChange}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            showCompanyOption={Boolean(activeVehicle?.used_by_business)}
            onAiParsed={(parsed: ExpenseParseResult) => {
              if (parsed.amount) handleAmountChange(parsed.amount.toString());
              if (parsed.date) setDate(parsed.date);
              if (parsed.fuelVolume) handleVolumeChange(parsed.fuelVolume.toString());
              if (parsed.category) setCategory(parsed.category);
              if (parsed.vendorName || parsed.merchant) {
                setVendorName(parsed.vendorName || parsed.merchant || '');
                setVendorLocation(parsed.merchant || parsed.vendorName || '');
              }
              if (parsed.lat && parsed.lon) {
                setLat(parsed.lat);
                setLon(parsed.lon);
              }
              if (parsed.notes) setNotes(parsed.notes);
              if (parsed.currency) handleCurrencyChange(parsed.currency);
              if (parsed.subItems && parsed.subItems.length > 0) {
                const convertedItems: EditableSubItem[] = parsed.subItems.map((sub) => ({
                  id: crypto.randomUUID(),
                  name: sub.name,
                  cost: sub.cost !== undefined ? sub.cost.toString() : '',
                  partNumber: sub.partNumber,
                }));
                setSubItems(convertedItems);
              }
            }}
          />
        )}

        {/* Sub-Items Editor for Service entries */}
        {(kind === 'service' || subItems.length > 0) && (
          <SubItemsEditor
            subItems={subItems}
            onChange={setSubItems}
            onAutoSum={(total) => setAmount(total.toFixed(2))}
            powertrain={activeVehicle?.powertrain}
          />
        )}

        {/* Category & Fuel Grade Selector */}
        {kind !== 'note' && (kind === 'expense' || (kind === 'refuel' && fuelGrade)) && (
          <GlassCard
            style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {kind === 'expense' && (
              <CategoryPicker category={category} onSelectCategory={setCategory} />
            )}

            {kind === 'refuel' && tanks.length > 1 && (
              <FormControl fullWidth>
                <InputLabel id="tank-selector-label">Vehicle Tank / Container</InputLabel>
                <Select
                  labelId="tank-selector-label"
                  value={selectedTankId}
                  label="Vehicle Tank / Container"
                  onChange={(e) => handleTankChange(e.target.value)}
                >
                  {tanks.map((tank) => (
                    <MenuItem key={tank.id} value={tank.id}>
                      {tank.name} ({tank.type.toUpperCase()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {kind === 'refuel' && (
              <FuelGradeSelector
                selectedGrade={fuelGrade}
                onSelectGrade={handleFuelGradeChange}
                filterCategory={
                  selectedTank?.type as 'petrol' | 'diesel' | 'gas' | 'ev' | 'alternative' | 'all'
                }
              />
            )}

            {kind === 'refuel' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <TextField
                  label="Volume (Liters / kWh)"
                  type="number"
                  slotProps={{ htmlInput: { step: '0.1' } }}
                  value={volumeLiters}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Price / Unit"
                  type="number"
                  slotProps={{ htmlInput: { step: '0.001' } }}
                  value={pricePerUnit}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  fullWidth
                />
              </div>
            )}
          </GlassCard>
        )}

        {/* Smart Capture & AI Image Summarizer */}
        <GlassCard
          style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: 'text.primary',
                fontWeight: 700,
              }}
            >
              Image & Media Attachment
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={aiSummaryEnabled}
                  onChange={(e) => setAiSummaryEnabled(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Summarize image with AI
                </Typography>
              }
              sx={{ margin: 0 }}
            />
          </div>
          <ReceiptCapture onImageReady={(img) => handleImageReady(img)} />
        </GlassCard>

        {/* Details & Location Metadata */}
        <EntryDetailsLocationCard
          date={date}
          onDateChange={setDate}
          odometerKm={odometerKm}
          onOdometerKmChange={setOdometerKm}
          distanceUnit={activeVehicle?.distance_unit}
          isOdometerRequired={kind !== 'note'}
          vendorName={vendorName}
          onVendorNameChange={setVendorName}
          vendorLocation={vendorLocation}
          onVendorLocationChange={setVendorLocation}
          lat={lat}
          lon={lon}
          onCoordsChange={(newLat, newLon) => {
            setLat(newLat);
            setLon(newLon);
          }}
          isFullTank={isFullTank}
          onFullTankChange={setIsFullTank}
          isBusiness={isBusiness}
          onBusinessChange={setIsBusiness}
          showFullTankOption={kind === 'refuel'}
          showBusinessOption={Boolean(activeVehicle?.used_by_business)}
        />

        {/* Recurring Expense Options — Hidden for Notes */}
        {kind !== 'note' && (
          <RecurringExpenseOptions
            isRecurring={isRecurring}
            onRecurringChange={setIsRecurring}
            recurringInterval={recurringInterval}
            onIntervalChange={setRecurringInterval}
            useSinkingFund={useSinkingFund}
            onSinkingFundChange={setUseSinkingFund}
          />
        )}

        {/* Notes & Tags */}
        <GlassCard
          style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            Notes & Memo
          </Typography>
          <TextField
            placeholder="Add memo (e.g. client meeting garage fee)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
        </GlassCard>

        {/* Form Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate({ to: '/garage' })}
            sx={{
              borderRadius: 3,
              height: 48,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(125, 211, 252, 0.2)',
              color: 'text.secondary',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            fullWidth
            sx={{
              borderRadius: 3,
              height: 48,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: '#93ddfd',
                boxShadow: '0 0 16px rgba(125, 211, 252, 0.4)',
              },
            }}
          >
            {submitting ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
}
