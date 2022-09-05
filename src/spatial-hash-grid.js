import { math } from "./math.js";

export const spatial_hash_grid = (() => {
  class SpatialHashGrid {
    _cells;
    _dimensions;
    _bounds;
    _queryIds;

    constructor(bounds, dimensions) {
      const [x, y] = dimensions;
      this._cells = [...Array(x)].map((_) => [...Array(y)].map((_) => null));
      this._dimensions = dimensions;
      this._bounds = bounds;
      this._queryIds = 0;
    }
  }

  return {
    SpatialHashGrid: SpatialHashGrid,
  };
})();
