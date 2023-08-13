# Layton's Easy Distances (LED)

A Roll20 utility API for easy distance calculations.

## Example use case

```ts
const distanceFromGraphicToCoordinates = Led.from(myGraphic)
  .to(3, 10)
  .byPythagoras()
  .inPageUnits();
```
