use tauri::State;
use veyak_error::AppResult;
use veyak_models::AppSettings;

use crate::state::AppState;

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> AppResult<AppSettings> {
    crate::db::settings::get_settings(&state.data_dir)
}

#[tauri::command]
pub async fn update_settings(state: State<'_, AppState>, settings: AppSettings) -> AppResult<()> {
    crate::db::settings::update_settings(&state.data_dir, &settings)
}
