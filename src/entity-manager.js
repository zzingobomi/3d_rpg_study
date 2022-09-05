export const entity_manager = (() => {
  // Entity Manager 에 Add 시키면 매 프레임마다 Entity들을 Update 시키고
  // Entity는 자식 Component 를 매 프레임마다 Update 시킨다.
  // Entity를 Add 시키면 Manager 가 parent 가 되고
  // Manager 의 Get 함수를 통해 Entity를 얻을 수 있다.
  class EntityManager {
    _ids;
    _entitiesMap;
    _entities;

    constructor() {
      this._ids = 0;
      this._entitiesMap = {};
      this._entities = [];
    }

    _GenerateName() {
      this._ids += 1;

      return "__name__" + this._ids;
    }

    Get(n) {
      return this._entitiesMap[n];
    }

    Filter(cb) {
      return this._entities.filter(cb);
    }

    Add(e, n) {
      if (!n) {
        n = this._GenerateName();
      }

      this._entitiesMap[n] = e;
      this._entities.push(e);

      e.SetParent(this);
      e.SetName(n);
      e.InitEntity();
    }

    SetActive(e, b) {
      const i = this._entities.indexOf(e);
      if (i < 0) {
        return;
      }

      this._entities.splice(i, 1);
    }

    Update(timeElapsed) {
      for (let e of this._entities) {
        e.Update(timeElapsed);
      }
    }
  }

  return {
    EntityManager: EntityManager,
  };
})();
