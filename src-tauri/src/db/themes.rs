use std::path::PathBuf;

use veyak_db::{read_yaml, write_yaml, DataDir};
use veyak_error::{AppError, AppResult};
use veyak_models::Theme;

pub fn list_themes(dd: &DataDir) -> AppResult<Vec<Theme>> {
    let mut themes: Vec<Theme> = Vec::new();
    let themes_dir = dd.themes_path();
    if themes_dir.exists() {
        for entry in std::fs::read_dir(&themes_dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("yaml") {
                if let Ok(theme) = read_yaml::<Theme>(&path) {
                    themes.push(theme);
                }
            }
        }
    }

    // Built-in themes first, then alphabetical
    themes.sort_by(|a, b| {
        b.is_builtin
            .cmp(&a.is_builtin)
            .then_with(|| a.name.cmp(&b.name))
    });
    Ok(themes)
}

pub fn get_theme(dd: &DataDir, id: &str) -> AppResult<Theme> {
    let themes = list_themes(dd)?;
    themes
        .into_iter()
        .find(|t| t.id == id)
        .ok_or_else(|| AppError::NotFound(format!("theme '{id}'")))
}

pub fn delete_theme(dd: &DataDir, id: &str) -> AppResult<()> {
    let theme = get_theme(dd, id)?;
    if theme.is_builtin {
        return Err(AppError::Invalid(
            "built-in themes can't be deleted".to_string(),
        ));
    }
    let theme_file: PathBuf = dd.themes_path().join(format!("{id}.yaml"));
    if theme_file.exists() {
        std::fs::remove_file(&theme_file)?;
    }
    Ok(())
}

pub async fn fetch_theme_preview(theme_id: &str) -> AppResult<Theme> {
    const REGISTRY_URL: &str = "https://veyak.iamdhakrey.dev/themes/registry.json";

    let response = reqwest::get(REGISTRY_URL)
        .await
        .map_err(|e| AppError::Invalid(format!("Failed to connect to theme registry: {e}")))?;
    let registry: Vec<Theme> = response
        .json()
        .await
        .map_err(|e| AppError::Invalid(format!("Failed to parse theme registry manifest: {e}")))?;

    let theme = registry
        .into_iter()
        .find(|t| t.id == theme_id)
        .ok_or_else(|| AppError::NotFound(format!("theme '{theme_id}' not found in registry")))?;

    Ok(theme)
}

pub fn save_theme(dd: &DataDir, mut theme: Theme) -> AppResult<Theme> {
    theme.is_builtin = false;
    let theme_file: PathBuf = dd.themes_path().join(format!("{}.yaml", theme.id));
    if let Some(parent) = theme_file.parent() {
        std::fs::create_dir_all(parent)?;
    }
    write_yaml(&theme_file, &theme)?;
    Ok(theme)
}

pub async fn install_theme(dd: &DataDir, theme_id: &str) -> AppResult<Theme> {
    let theme = fetch_theme_preview(theme_id).await?;
    save_theme(dd, theme)
}
