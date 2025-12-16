// Краснодарский край - сельхоз угодья вокруг Краснодара
var region = ee.Geometry.Rectangle([38.5, 44.0, 40.5, 45.0]);


// Sentinel-2 за летний период
var image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(region)
    .filterDate('2024-06-01', '2024-08-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
    .median();

// Расчет NDVI
var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Визуализация
Map.centerObject(region, 10);
Map.addLayer(ndvi, {min: 0.1, max: 0.8, palette: [
  'FF0000', 'FFFF00', '00FF00'  // красный-желтый-зеленый
]}, 'NDVI Краснодарский край');
Map.addLayer(region, {color: 'blue'}, 'Регион', false);

// Среднее значение NDVI
var meanNDVI = ndvi.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: 50,
    maxPixels: 1e9
});
print('Средний NDVI:', meanNDVI.get('NDVI'));
