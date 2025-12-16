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
var ndmi = getNDMISimple(region, '2023-07-01', '2023-07-31');

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
