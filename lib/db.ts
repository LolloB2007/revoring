// Legacy import path. Kept so older imports still resolve while we migrate to
// `store` + `models`. Re-exports the new JSON-file store and table names.
export { store } from "./store";
export { TABLES } from "./models";
