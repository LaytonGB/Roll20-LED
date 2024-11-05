# Layton's Easy Distances (LED)

Usage instructions and more: https://app.roll20.net/forum/post/11623741/laytons-easy-distances-led-new-utility-api/?pagenum=1

A Roll20 utility API for easy distance calculations.

## Example use case

```ts
const distanceFromGraphicToCoordinates = Led.from(myGraphic)
  ?.to(3, 10)
  ?.byPythagoras()
  ?.inPageUnits();
```
