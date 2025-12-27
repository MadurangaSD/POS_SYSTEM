const axios = require("axios");

/**
 * BarcodeService - Lookup product information from barcode databases
 * 
 * Uses Open Food Facts API:
 * ✅ Completely FREE - no API key required
 * ✅ Millions of grocery products worldwide
 * ✅ Great coverage for Sri Lanka and Asian products
 * ✅ Returns: name, brand, category, image, ingredients, nutrition
 */
class BarcodeService {
  /**
   * Lookup product information by barcode using Open Food Facts
   * Best free API for grocery/food products
   */
  static async lookupBarcode(barcode) {
    // Use Open Food Facts as primary source
    const result = await this.lookupOpenFoodFacts(barcode);

    if (result) {
      return result;
    }

    // If no data found
    throw {
      status: 404,
      message: "Product not found in Open Food Facts database. You can add products manually.",
    };
  }

  /**
   * Open Food Facts API - FREE, no API key required!
   * ✅ Best for: Packaged food/grocery products
   * ✅ Coverage: Worldwide including Sri Lanka, India, Asia
   * ✅ Data: Name, brand, category, image, ingredients, nutrition, allergens
   */
  static async lookupOpenFoodFacts(barcode) {
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        {
          timeout: 8000, // Increased timeout for better reliability
          headers: {
            "User-Agent": "POS-System-SriLanka/1.0",
          },
        }
      );

      if (response.data.status !== 1 || !response.data.product) {
        return null;
      }

      const product = response.data.product;

      return {
        source: "Open Food Facts",
        barcode: barcode,
        name: product.product_name || product.product_name_en || product.generic_name || "Unknown Product",
        brand: product.brands || "",
        category: this.mapOpenFoodCategory(product.categories_tags),
        description: product.ingredients_text || product.ingredients_text_en || "",
        image: product.image_url || product.image_front_url || "",
        weight: product.quantity || "",
        metadata: {
          nutrition: product.nutriments || {},
          allergens: product.allergens_tags || [],
          labels: product.labels_tags || [],
          countries: product.countries_tags || [],
        },
      };
    } catch (error) {
      console.log("Open Food Facts lookup failed:", error.message);
      return null;
    }
  }

  /**
   * UPCitemdb.com API - Free tier: 100 requests/day
   * Good for: General products, not just food
   * Note: Requires API key for higher limits
   */
  static async lookupUPCItemDB(barcode) {
    try {
      // Free tier endpoint (no API key, limited to 100/day per IP)
      const response = await axios.get(
        `https://api.upcitemdb.com/prod/trial/lookup`,
        {
          params: { upc: barcode },
          timeout: 5000,
          headers: {
            "User-Agent": "POS-System/1.0",
          },
        }
      );

      if (
        !response.data.items ||
        !response.data.items.length ||
        response.data.code !== "OK"
      ) {
        return null;
      }

      const item = response.data.items[0];

      return {
        source: "UPCitemdb",
        barcode: barcode,
        name: item.title || "Unknown Product",
        brand: item.brand || "",
        category: this.mapUPCCategory(item.category),
        description: item.description || "",
        image: item.images && item.images.length ? item.images[0] : "",
        weight: item.size || "",
        metadata: {
          ean: item.ean,
          model: item.model,
          color: item.color,
          size: item.size,
        },
      };
    } catch (error) {
      console.log("UPCitemdb lookup failed:", error.message);
      return null;
    }
  }

  /**
   * Map Open Food Facts categories to POS system categories
   * Optimized for Sri Lankan grocery products
   */
  static mapOpenFoodCategory(categories) {
    if (!categories || !categories.length) return "other";

    const categoryStr = categories.join(" ").toLowerCase();

    // Beverages
    if (
      categoryStr.includes("beverage") ||
      categoryStr.includes("drink") ||
      categoryStr.includes("juice") ||
      categoryStr.includes("water") ||
      categoryStr.includes("tea") ||
      categoryStr.includes("coffee") ||
      categoryStr.includes("soda")
    )
      return "beverages";

    // Dairy
    if (
      categoryStr.includes("dairy") ||
      categoryStr.includes("milk") ||
      categoryStr.includes("yogurt") ||
      categoryStr.includes("cheese") ||
      categoryStr.includes("butter")
    )
      return "dairy";

    // Snacks
    if (
      categoryStr.includes("snack") ||
      categoryStr.includes("chip") ||
      categoryStr.includes("candy") ||
      categoryStr.includes("chocolate") ||
      categoryStr.includes("biscuit") ||
      categoryStr.includes("cookie")
    )
      return "snacks";

    // Meat & Seafood
    if (
      categoryStr.includes("meat") ||
      categoryStr.includes("chicken") ||
      categoryStr.includes("fish") ||
      categoryStr.includes("seafood") ||
      categoryStr.includes("sausage")
    )
      return "meat";

    // Vegetables & Fruits
    if (
      categoryStr.includes("vegetable") ||
      categoryStr.includes("fruit") ||
      categoryStr.includes("produce")
    )
      return "vegetables";

    // Bakery
    if (
      categoryStr.includes("bread") ||
      categoryStr.includes("bakery") ||
      categoryStr.includes("cake") ||
      categoryStr.includes("pastries")
    )
      return "bakery";

    // Rice, Noodles, Pasta
    if (
      categoryStr.includes("rice") ||
      categoryStr.includes("noodle") ||
      categoryStr.includes("pasta") ||
      categoryStr.includes("grain")
    )
      return "grains";

    // Spices & Condiments (common in Sri Lankan cuisine)
    if (
      categoryStr.includes("spice") ||
      categoryStr.includes("sauce") ||
      categoryStr.includes("condiment") ||
      categoryStr.includes("curry")
    )
      return "spices";

    // Household items
    if (
      categoryStr.includes("cleaning") ||
      categoryStr.includes("detergent") ||
      categoryStr.includes("soap")
    )
      return "household";

    // Default to food if it's in food category
    if (categoryStr.includes("food")) return "food";

    return "other";
  }

  /**
   * Validate barcode format
   * Supports: UPC-A (12), UPC-E (8), EAN-13 (13), EAN-8 (8), ITF-14 (14)
   * Common in Sri Lanka: EAN-13, EAN-8
   */
  static validateBarcode(barcode) {
    if (!barcode) return false;

    // Remove any spaces or dashes
    const cleaned = barcode.replace(/[\s-]/g, "");

    // Check if it's numeric and valid length
    const isNumeric = /^\d+$/.test(cleaned);
    const validLengths = [8, 12, 13, 14];

    return isNumeric && validLengths.includes(cleaned.length);
  }
}

module.exports = BarcodeService;
