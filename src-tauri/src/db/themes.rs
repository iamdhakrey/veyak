use veyak_db::{read_yaml, read_yaml_vec, write_yaml, DataDir};
use veyak_error::{AppError, AppResult};
use veyak_models::Theme;

pub fn list_themes(dd: &DataDir) -> AppResult<Vec<Theme>> {
    let mut themes: Vec<Theme> = Vec::new();
    // walk to the dir and read the yaml files.
    for entry in std::fs::read_dir(&dd.themes_path())? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("yaml") {
            let theme: Theme = read_yaml(&path)?;
            themes.push(theme);
        }
    }

    // Built-in themes first, then alphabetical
    themes.sort_by(|a, b| {
        b.is_builtin
            .cmp(&a.is_builtin)
            .then_with(|| a.name.cmp(&b.name))
    });
    println!("list themes from db folder {:?}", themes);
    Ok(themes)
}

pub fn get_theme(dd: &DataDir, id: &str) -> AppResult<Theme> {
    let themes = list_themes(dd)?;
    println!("themes {:?}", themes);
    themes
        .into_iter()
        .find(|t| t.id == id)
        .ok_or_else(|| AppError::NotFound(format!("theme '{id}'")))
}

// pub fn save_custom_theme(
//     dd: &DataDir,
//     id: Option<&str>,
//     name: &str,
//     tokens: &ThemeTokens,
// ) -> AppResult<Theme> {
//     let id = id.map(str::to_string).unwrap_or_else(veyak_db::new_id);
//     let mut themes: Vec<Theme> = read_yaml_vec(&dd.themes_path())?;

//     if let Some(existing) = themes.iter_mut().find(|t| t.id == id) {
//         existing.name = name.to_string();
//         existing.tokens = tokens.clone();
//     } else {
//         themes.push(Theme {
//             id: id.clone(),
//             name: name.to_string(),
//             tokens: tokens.clone(),
//         });
//     }

//     write_yaml(&dd.themes_path(), &themes)?;
//     get_theme(dd, &id)
// }

pub fn delete_theme(dd: &DataDir, id: &str) -> AppResult<()> {
    let theme = get_theme(dd, id)?;
    if theme.is_builtin {
        return Err(AppError::Invalid(
            "built-in themes can't be deleted".to_string(),
        ));
    }
    let mut themes: Vec<Theme> = read_yaml_vec(&dd.themes_path())?;
    themes.retain(|t| t.id != id);
    write_yaml(&dd.themes_path(), &themes)
}
