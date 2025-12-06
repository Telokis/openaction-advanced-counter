use openaction::*;

use log::{debug, error};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize, Clone)]
#[serde(default)]
struct AdvancedCounterSettings {
  step: isize,
  value: isize,
  file: Option<String>,
  pattern: Option<String>,
}
impl Default for AdvancedCounterSettings {
  fn default() -> Self {
    Self {
      step: 1,
      value: 0,
      file: None,
      pattern: None,
    }
  }
}

async fn increment(
  instance: &Instance,
  settings: &AdvancedCounterSettings,
  step: isize,
) -> OpenActionResult<()> {
  let mut clone = settings.clone();
  clone.value = settings.value + step;

  write_to_file(instance, &clone).await?;

  instance.set_settings(&clone).await?;
  instance
    .set_title(Some(clone.value.to_string()), None)
    .await
}

async fn write_to_file(
  instance: &Instance,
  settings: &AdvancedCounterSettings,
) -> OpenActionResult<()> {
  if let Some(file_path) = &settings.file {
    let err = if let Some(pattern) = &settings.pattern {
      fs::write(
        file_path,
        pattern.replace("{}", &settings.value.to_string()),
      )
    } else {
      fs::write(file_path, settings.value.to_string())
    };

    if let Err(err) = err {
      error!("Error when writing to file '{file_path}': {err}");
      instance.show_alert().await?;
    }
  }

  Ok(())
}

struct AdvancedCounterAction;
#[async_trait]
impl Action for AdvancedCounterAction {
  const UUID: ActionUuid = "me.telokis.oa-advanced-counter.counter";
  type Settings = AdvancedCounterSettings;

  async fn key_up(&self, instance: &Instance, settings: &Self::Settings) -> OpenActionResult<()> {
    increment(instance, settings, settings.step).await
  }

  async fn dial_up(&self, instance: &Instance, settings: &Self::Settings) -> OpenActionResult<()> {
    self.key_down(instance, settings).await
  }

  async fn dial_rotate(
    &self,
    instance: &Instance,
    settings: &Self::Settings,
    ticks: i16,
    _pressed: bool,
  ) -> OpenActionResult<()> {
    increment(instance, settings, settings.step * (ticks as isize)).await
  }

  async fn did_receive_settings(
    &self,
    instance: &Instance,
    settings: &Self::Settings,
  ) -> OpenActionResult<()> {
    instance
      .set_title(Some(settings.value.to_string()), None)
      .await?;

    write_to_file(instance, settings).await
  }
}

#[tokio::main]
async fn main() -> OpenActionResult<()> {
  {
    use simplelog::*;
    if let Err(error) = TermLogger::init(
      LevelFilter::Debug,
      Config::default(),
      TerminalMode::Stdout,
      ColorChoice::Never,
    ) {
      eprintln!("Logger initialization failed: {}", error);
    }
  }

  debug!("Setting up Advanced Counter.");

  register_action(AdvancedCounterAction).await;

  run(std::env::args().collect()).await
}
