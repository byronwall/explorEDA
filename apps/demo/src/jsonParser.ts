import { DatumObject } from "./LandingPage";

function flattenObject(obj: Record<string, unknown>, prefix = ""): DatumObject {
  return Object.keys(obj).reduce((acc: DatumObject, key: string) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          const arrayFlattened = flattenObject(
            item as Record<string, unknown>,
            `${newKey}[${index}]`
          );
          Object.assign(acc, arrayFlattened);
        } else {
          acc[`${newKey}[${index}]`] =
            item === null ? undefined : (item as string | number | boolean);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects
      Object.assign(
        acc,
        flattenObject(value as Record<string, unknown>, newKey)
      );
    } else {
      // Handle primitive values
      acc[newKey] =
        value === null ? undefined : (value as string | number | boolean);
    }

    return acc;
  }, {});
}

export async function parseJsonData(file: File): Promise<DatumObject[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);

        if (
          !(
            (Array.isArray(jsonData) &&
              jsonData.every(
                (item) =>
                  typeof item === "object" &&
                  item !== null &&
                  !Array.isArray(item)
              )) ||
            (typeof jsonData === "object" &&
              jsonData !== null &&
              !Array.isArray(jsonData))
          )
        ) {
          throw new Error("JSON must contain an object or an array of objects");
        }

        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

        // Convert each object to flattened format
        const flattenedData = dataArray.map((item) => flattenObject(item));

        resolve(flattenedData);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Failed to parse JSON file")
        );
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
