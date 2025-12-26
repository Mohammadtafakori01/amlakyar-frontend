/**
 * Sanitize property file data before sending to API
 * Converts string numbers to numbers and removes null/undefined/empty values
 */
export const sanitizePropertyFileData = <T extends Record<string, any>>(data: T): Partial<T> => {
  const sanitized: any = {};

  // Numeric fields that should be converted to numbers
  const numericFields = [
    'totalPrice',
    'unitPrice',
    'mortgagePrice',
    'unitsPerFloor',
    'totalFloors',
    'totalArea',
    'landArea',
    'buildingAge',
    'renovated',
    'length',
    'width',
    'yard',
    'backyard',
    'basement',
    'servantRoom',
    'porch',
  ];

  // Boolean fields
  const booleanFields = [
    'residential',
    'vacant',
    'rentStatus',
    'heating',
    'elevator',
    'sauna',
    'jacuzzi',
    'pool',
    'videoIntercom',
    'remoteDoor',
    'hasServantRoom',
    'hasYard',
    'hasPorch',
  ];

  // Handle floors array first - always include it even if empty
  const floorsValue = data.floors;
  if (Array.isArray(floorsValue)) {
    if (floorsValue.length > 0) {
      // Sanitize each floor object
      const sanitizedFloors = floorsValue.map((floor: any) => {
        const sanitizedFloor: any = {};
        
        // floorNumber is required
        if (floor.floorNumber !== undefined && floor.floorNumber !== null) {
          sanitizedFloor.floorNumber = Number(floor.floorNumber);
        }
        
        // Optional numeric fields
        if (floor.area !== undefined && floor.area !== null && floor.area !== '') {
          const areaValue = typeof floor.area === 'string' ? parseFloat(floor.area) : Number(floor.area);
          if (!isNaN(areaValue) && areaValue >= 0) {
            sanitizedFloor.area = areaValue;
          }
        }
        if (floor.bedrooms !== undefined && floor.bedrooms !== null && floor.bedrooms !== '') {
          const bedroomsValue = typeof floor.bedrooms === 'string' ? parseInt(floor.bedrooms, 10) : Number(floor.bedrooms);
          if (!isNaN(bedroomsValue) && bedroomsValue >= 0) {
            sanitizedFloor.bedrooms = bedroomsValue;
          }
        }
        if (floor.bathroom !== undefined && floor.bathroom !== null && floor.bathroom !== '') {
          const bathroomValue = typeof floor.bathroom === 'string' ? parseInt(floor.bathroom, 10) : Number(floor.bathroom);
          if (!isNaN(bathroomValue) && bathroomValue >= 0) {
            sanitizedFloor.bathroom = bathroomValue;
          }
        }
        
        // Optional string fields
        if (floor.flooring !== undefined && floor.flooring !== null && floor.flooring !== '') {
          sanitizedFloor.flooring = String(floor.flooring).trim();
        }
        
        // Boolean fields - always include them with default false
        sanitizedFloor.phone = Boolean(floor.phone || false);
        sanitizedFloor.kitchen = Boolean(floor.kitchen || false);
        sanitizedFloor.openKitchen = Boolean(floor.openKitchen || false);
        sanitizedFloor.parking = Boolean(floor.parking || false);
        sanitizedFloor.storage = Boolean(floor.storage || false);
        sanitizedFloor.fireplace = Boolean(floor.fireplace || false);
        sanitizedFloor.cooler = Boolean(floor.cooler || false);
        sanitizedFloor.fanCoil = Boolean(floor.fanCoil || false);
        sanitizedFloor.chiller = Boolean(floor.chiller || false);
        sanitizedFloor.package = Boolean(floor.package || false);
        
        return sanitizedFloor;
      });
      sanitized.floors = sanitizedFloors;
    } else {
      // Empty array - send empty array
      sanitized.floors = [];
    }
  } else {
    // floors not in data or not an array - send empty array
    sanitized.floors = [];
  }

  for (const [key, value] of Object.entries(data)) {
    // Skip floors as we already handled it above
    if (key === 'floors') {
      continue;
    }

    // Skip undefined values (except for floors which we handled above)
    if (value === undefined) {
      continue;
    }

    // Handle null values - skip them for most fields
    if (value === null) {
      // Skip null for all fields (including mortgagePrice)
      continue;
    }

    // Handle numeric fields
    if (numericFields.includes(key)) {
      if (value === '' || value === null || value === undefined) {
        continue; // Skip empty or null numeric values
      }
      // Convert string to number, handling Persian digits and commas
      let numValue: number;
      if (typeof value === 'string') {
        // Remove commas and convert Persian digits to English
        const cleaned = value.replace(/,/g, '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
        numValue = parseFloat(cleaned);
      } else {
        numValue = Number(value);
      }
      if (!isNaN(numValue) && numValue >= 0) {
        sanitized[key] = numValue;
      }
      continue;
    }

    // Handle boolean fields
    if (booleanFields.includes(key)) {
      sanitized[key] = Boolean(value);
      continue;
    }

    // Handle string fields - skip empty strings for optional fields
    if (typeof value === 'string') {
      if (value.trim() === '' && key !== 'unit' && key !== 'description' && key !== 'facade' && key !== 'documentStatus') {
        continue;
      }
      sanitized[key] = value.trim();
      continue;
    }

    // Handle other arrays (not floors)
    if (Array.isArray(value)) {
      sanitized[key] = value;
      continue;
    }

    // Handle other types
    sanitized[key] = value;
  }

  return sanitized;
};

