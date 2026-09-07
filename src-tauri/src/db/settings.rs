use veyak_db::{read_yaml_or_default, write_yaml, DataDir};
use veyak_error::AppResult;
use veyak_models::AppSettings;

pub fn get_settings(dd: &DataDir) -> AppResult<AppSettings> {
    read_yaml_or_default(&dd.settings_path())
}

pub fn update_settings(dd: &DataDir, settings: &AppSettings) -> AppResult<()> {
    write_yaml(&dd.settings_path(), settings)
}
