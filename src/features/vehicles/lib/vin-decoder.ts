export interface DecodedVehicleSpecs {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
  trim?: string;
  powertrain?: 'ice' | 'hybrid' | 'phev' | 'ev' | 'hydrogen';
  fuelTypePrimary?: string;
  bodyClass?: string;
  driveType?: string;
  engineCylinders?: string;
  displacementL?: string;
  doors?: string;
  plantCountry?: string;
  plantState?: string;
  rawResults?: Record<string, string>;
}

export async function decodeVinWithNhtsa(vin: string): Promise<DecodedVehicleSpecs | null> {
  const cleanVin = vin.trim().toUpperCase();
  if (!cleanVin || cleanVin.length < 11) return null;

  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(cleanVin)}?format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.Results?.[0];
    if (!result) return null;

    const rawResults: Record<string, string> = {};
    for (const [key, val] of Object.entries(result)) {
      if (val && typeof val === 'string' && val.trim()) {
        rawResults[key] = val.trim();
      }
    }

    const make = result.Make?.trim() || undefined;
    const model = result.Model?.trim() || undefined;
    const year = result.ModelYear?.trim() || undefined;
    const trim = result.Trim?.trim() || result.Series?.trim() || undefined;

    // Map powertrain
    let powertrain: DecodedVehicleSpecs['powertrain'];
    const fuelPrimary = (result.FuelTypePrimary || '').toLowerCase();
    const fuelSecondary = (result.FuelTypeSecondary || '').toLowerCase();
    const elecLevel = (result.ElectrificationLevel || '').toLowerCase();

    if (
      fuelPrimary.includes('electric') ||
      elecLevel.includes('bev') ||
      elecLevel.includes('battery electric')
    ) {
      powertrain = 'ev';
    } else if (
      fuelPrimary.includes('plug-in') ||
      fuelSecondary.includes('electric') ||
      elecLevel.includes('phev') ||
      elecLevel.includes('plug-in')
    ) {
      powertrain = 'phev';
    } else if (
      fuelPrimary.includes('hybrid') ||
      fuelSecondary.includes('hybrid') ||
      elecLevel.includes('hev')
    ) {
      powertrain = 'hybrid';
    } else if (fuelPrimary.includes('hydrogen') || fuelPrimary.includes('fuel cell')) {
      powertrain = 'hydrogen';
    } else if (fuelPrimary) {
      powertrain = 'ice';
    }

    return {
      vin: cleanVin,
      make,
      model,
      year,
      trim,
      powertrain,
      fuelTypePrimary: result.FuelTypePrimary || undefined,
      bodyClass: result.BodyClass || undefined,
      driveType: result.DriveType || undefined,
      engineCylinders: result.EngineCylinders || undefined,
      displacementL: result.DisplacementL || undefined,
      doors: result.Doors || undefined,
      plantCountry: result.PlantCountry || undefined,
      plantState: result.PlantState || undefined,
      rawResults,
    };
  } catch (error) {
    console.error('Failed to decode VIN via NHTSA VPIC API:', error);
    return null;
  }
}
