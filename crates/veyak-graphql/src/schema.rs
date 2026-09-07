/// Re-export schema types from `veyak-models` for convenience.
/// The actual struct definitions live in `veyak-models` so they
/// can be shared with the Tauri commands layer and exported to TS via `ts-rs`.
pub use veyak_models::{
    GraphQlArg, GraphQlEnumValue, GraphQlField, GraphQlSchema, GraphQlSchemaType, GraphQlTypeRef,
};
