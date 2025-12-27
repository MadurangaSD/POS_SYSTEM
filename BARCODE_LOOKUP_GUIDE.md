# Barcode Lookup Integration Guide

## Overview
The POS system now supports automatic product information lookup using barcode/UPC databases. This feature significantly speeds up product entry by automatically retrieving product names, brands, categories, and other details.

## Supported APIs

### 1. **Open Food Facts** (Free, No API Key Required)
- **Coverage**: 800K+ food products worldwide
- **Best for**: Packaged food items, beverages, dairy products
- **Includes**: Product names, brands, nutrition info, allergens, images
- **Website**: https://world.openfoodfacts.org

### 2. **UPCitemdb.com** (Free Tier: 100 requests/day)
- **Coverage**: General products (food, electronics, household)
- **Best for**: Non-food items, electronics, household products
- **Includes**: Product names, brands, images, descriptions
- **Website**: https://www.upcitemdb.com
- **Free Tier**: 100 lookups per day (per IP address)

## Features

✅ **Automatic Product Detection**
- Enter any barcode (UPC-A, UPC-E, EAN-8, EAN-13)
- System checks your database first
- If not found, queries external APIs
- Auto-fills product form with retrieved data

✅ **Multi-API Fallback**
- Tries Open Food Facts first
- Falls back to UPCitemdb if not found
- Shows which API provided the data

✅ **Smart Category Mapping**
- Automatically maps external categories to your system
- Supports: beverages, dairy, snacks, meat, vegetables, etc.

✅ **Validation**
- Validates barcode format before lookup
- Prevents duplicate products
- Shows helpful error messages

## How to Use

### From Admin Dashboard

1. **Navigate to Products Page**
   - Go to Admin Dashboard → Products

2. **Add New Product**
   - Click "Add Product" button
   - Enter the barcode in the barcode field
   - Click the "Lookup" button (with scan icon)

3. **Review Auto-Filled Data**
   - Product name, brand, and category are automatically filled
   - Product image URL (if available) in metadata
   - You MUST set your own:
     - Cost Price
     - Selling Price
     - Initial Stock quantity
     - Reorder level

4. **Save Product**
   - Review all information
   - Adjust prices and quantities
   - Click "Save" to add to your catalog

### Barcode Formats Supported
- **UPC-A**: 12 digits (e.g., 012345678901)
- **UPC-E**: 8 digits (e.g., 01234567)
- **EAN-13**: 13 digits (e.g., 0123456789012)
- **EAN-14**: 14 digits (e.g., 01234567890123)

### Example Barcodes to Test

**Food Products (Open Food Facts):**
- `4900590001807` - Coca Cola
- `8718215168876` - Milk product
- `3017620422003` - Nutella
- `5000159407236` - Cadbury Dairy Milk

**General Products:**
- `012345678901` - Various packaged goods
- Try any barcode from products you have!

## API Response Example

```json
{
  "found": true,
  "existsInDatabase": false,
  "product": {
    "source": "Open Food Facts",
    "barcode": "4900590001807",
    "name": "Coca Cola",
    "brand": "Coca Cola",
    "category": "beverages",
    "description": "Carbonated soft drink",
    "image": "https://images.openfoodfacts.org/...",
    "weight": "330ml",
    "metadata": {
      "nutrition": {...},
      "allergens": [],
      "labels": ["carbonated"]
    }
  },
  "message": "Product found via Open Food Facts"
}
```

## Backend API

### Endpoint
```
GET /api/products/lookup/:barcode
```

### Headers
```
Authorization: Bearer <admin_token>
```

### Response Codes
- `200` - Product found and returned
- `400` - Invalid barcode format
- `404` - Product not found in any database
- `401` - Unauthorized (admin only)

### Example Request
```bash
curl http://localhost:3001/api/products/lookup/4900590001807 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Adding More APIs

Want to integrate additional barcode APIs? Here's how:

### 1. Find an API
Popular options:
- **Barcode Lookup**: https://www.barcodelookup.com/api
- **DataFiniti**: https://developer.datafiniti.co/
- **Chomp Food API**: https://chompthis.com/api/

### 2. Add to BarcodeService

Edit `backend/src/services/BarcodeService.js`:

```javascript
static async lookupYourAPI(barcode) {
  try {
    const response = await axios.get(
      `https://your-api.com/lookup/${barcode}`,
      {
        headers: { 'API-Key': process.env.YOUR_API_KEY },
        timeout: 5000
      }
    );
    
    // Map response to standard format
    return {
      source: "Your API Name",
      barcode: barcode,
      name: response.data.productName,
      brand: response.data.brand,
      category: this.mapCategory(response.data.category),
      // ... other fields
    };
  } catch (error) {
    return null;
  }
}
```

### 3. Add to Lookup Chain

Update the `lookupBarcode()` method:

```javascript
const results = await Promise.allSettled([
  this.lookupOpenFoodFacts(barcode),
  this.lookupUPCItemDB(barcode),
  this.lookupYourAPI(barcode), // Add your new API
]);
```

## Configuration

### Environment Variables (Optional)

If you want to use paid API tiers, add to `.env`:

```bash
# UPCitemdb API Key (for higher rate limits)
UPCITEMDB_API_KEY=your_api_key_here

# Barcode Lookup API
BARCODE_LOOKUP_API_KEY=your_api_key_here
```

Then use in service:
```javascript
headers: {
  'Authorization': `Bearer ${process.env.UPCITEMDB_API_KEY}`
}
```

## Rate Limits

### Free Tier Limits:
- **Open Food Facts**: Unlimited (please be reasonable)
- **UPCitemdb**: 100 requests/day per IP

### Recommendations:
1. **Cache Results**: Store lookup results to avoid repeat calls
2. **Manual Entry**: Always allow manual product entry as fallback
3. **Upgrade if Needed**: Consider paid plans for high-volume usage

## Troubleshooting

### "Product not found in barcode databases"
- The barcode may not be in the databases (especially local/regional products)
- Try manually entering product information
- The barcode might be wrong - double-check it

### "Invalid barcode format"
- Ensure barcode is 8, 12, 13, or 14 digits
- Remove any spaces or special characters
- Some internal barcodes (store-specific) won't work

### Rate Limit Exceeded
- You've hit the 100/day limit on UPCitemdb
- Wait 24 hours or upgrade to paid plan
- Open Food Facts should still work

### API Timeout
- Network issue or API is slow/down
- Try again in a few moments
- Check your internet connection

## Benefits vs Manual Entry

| Aspect | Manual Entry | Barcode Lookup |
|--------|-------------|----------------|
| Time per product | 2-3 minutes | 10-30 seconds |
| Accuracy | Prone to typos | Accurate data |
| Product images | Manual upload | Auto-included |
| Consistency | Varies | Standardized |
| Nutrition info | Not included | Included (food) |

## Next Steps

1. ✅ Test with real product barcodes
2. ⏳ Consider adding product image upload/display
3. ⏳ Implement barcode scanning via webcam
4. ⏳ Add bulk import from CSV
5. ⏳ Cache frequently looked-up products

## Related Documentation
- [Product Management Guide](./FEATURES_COMPLETE.md#product-management)
- [API Documentation](./backend/API_DOCUMENTATION.md)
- [Admin Features](./ADMIN_FEATURES.txt)
