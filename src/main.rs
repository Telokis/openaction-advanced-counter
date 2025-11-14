use openaction::*;

use serde::{Deserialize, Serialize};

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

  if let Some(file_path) = &clone.file {
    println!("File path is {file_path}");
  }

  instance.set_settings(&clone).await?;
  instance
    .set_title(Some(clone.value.to_string()), None)
    .await
}

struct AdvancedCounterAction;
#[async_trait]
impl Action for AdvancedCounterAction {
  const UUID: ActionUuid = "me.telokis.oa-advanced-counter.persisted";
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

  eprintln!("Setting up Advanced Counter.");

  register_action(AdvancedCounterAction).await;

  run(std::env::args().collect()).await
}
