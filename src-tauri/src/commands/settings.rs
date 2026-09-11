use tauri::State;
use veyak_error::AppResult;
use veyak_models::{AppSettings, Theme};

use crate::state::AppState;

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> AppResult<AppSettings> {
    crate::db::settings::get_settings(&state.data_dir)
}

#[tauri::command]
pub async fn update_settings(state: State<'_, AppState>, settings: AppSettings) -> AppResult<()> {
    crate::db::settings::update_settings(&state.data_dir, &settings)
}

// themes
#[tauri::command]
pub async fn list_themes(state: State<'_, AppState>) -> AppResult<Vec<Theme>> {
    crate::db::themes::list_themes(&state.data_dir)
}

#[tauri::command]
pub async fn delete_theme(state: State<'_, AppState>, id: String) -> AppResult<()> {
    crate::db::themes::delete_theme(&state.data_dir, &id)
}

#[tauri::command]
pub async fn set_active_theme(state: State<'_, AppState>, id: String) -> AppResult<()> {
    crate::db::app_state::set_active_theme(&state.data_dir, &id)
}
