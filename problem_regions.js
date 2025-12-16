// ПРОСТОЙ РАБОЧИЙ КОД ДЛЯ NDMI

// 1. Определяем функцию расчета NDMI
function getNDMISimple(geometry, startDate, endDate) {
  // Используем Landsat 8
  var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
      .filterBounds(geometry)
      .filterDate(startDate, endDate)
      .filter(ee.Filter.lt('CLOUD_COVER', 20));
  
  // Масштабирование значений
  var scaled = collection.map(function(image) {
    var optical = image.select('SR_B[1-7]').multiply(0.0000275).add(-0.2);
    return optical.copyProperties(image, ['system:time_start']);
  });
  
  // Расчет NDMI: (NIR - SWIR1) / (NIR + SWIR1)
  var ndmi = scaled.median()
      .normalizedDifference(['SR_B5', 'SR_B6'])
      .rename('NDMI')
      .clip(geometry);
  
  return ndmi;
}

// 2. Определяем область
var region = ee.Geometry.Rectangle([38.5, 44.0, 40.5, 45.0]);

// 3. Получаем NDMI
var ndmi = getNDMISimple(region, '2024-07-01', '2024-07-31');

// 4. Визуализируем
Map.centerObject(region, 10);
Map.addLayer(ndmi, {
  min: -0.5,
  max: 0.5,
  palette: ['red', 'yellow', 'green', 'blue']
}, 'NDMI');

// 5. Статистика
var stats = ndmi.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: region,
  scale: 100,
  maxPixels: 1e9
});

print('Средний NDMI:', stats.get('NDMI'));

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
