export const defs = (() => {
  const _CHARACTER_MODELS = {
    guard: {
      base: "paladin.glb",
      path: "./resources/characters/",
      scale: 6.0,
    },
    paladin: {
      base: "paladin.glb",
      path: "./resources/characters/",
      scale: 6.0,
    },
    sorceror: {
      base: "sorceror.glb",
      path: "./resources/characters/",
      scale: 4.0,
    },
  };

  return {
    CHARACTER_MODELS: _CHARACTER_MODELS,
  };
})();
