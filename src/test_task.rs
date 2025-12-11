use log::error;
use std::sync::{
  Arc,
  atomic::{AtomicBool, Ordering},
};
use tokio::{
  task::JoinHandle,
  time::{Duration, interval, sleep},
};
use tokio_util::sync::CancellationToken;

struct LongPressData {
  token: Option<CancellationToken>,
  task: Option<JoinHandle<()>>,
  was_long_pressed: Arc<AtomicBool>,
}

impl Default for LongPressData {
  fn default() -> Self {
    Self {
      token: None,
      task: None,
      was_long_pressed: Arc::new(AtomicBool::new(false)),
    }
  }
}

impl LongPressData {
  async fn ensure_task_is_cancelled(&mut self) {
    let taken_token = self.token.take();
    if let Some(token) = taken_token {
      token.cancel();

      // Wait for the task to finish
      let taken_task = self.task.take();
      if let Some(task) = taken_task
        && let Err(err) = task.await
      {
        error!("Task panicked with error: '{err}'.");
      }
    }
  }

  async fn on_key_up(&mut self) {
    self.ensure_task_is_cancelled().await;

    if !self.was_long_pressed.load(Ordering::Relaxed) {
      // Trigger short press event
      println!("Short press event!");
    }

    self.was_long_pressed.store(false, Ordering::Relaxed);
  }

  async fn on_key_down(&mut self) {
    println!("Starting on_key_down...");

    // Should never do anything, in theory
    self.ensure_task_is_cancelled().await;

    // token needs to be stored in the struct for reference
    let token = CancellationToken::new();
    let token_clone = token.clone();
    self.token = Some(token);

    let was_long_pressed = self.was_long_pressed.clone();

    // Task should be stored in the struct? Unsure
    self.task = Some(tokio::spawn(async move {
      let sleep_timer = sleep(Duration::from_secs(2));

      tokio::select! {
        biased;

        _ = token_clone.cancelled() => {
          println!("Outer select cancelled");
        }

        _ = sleep_timer => {
          println!("Sleep performed");
          was_long_pressed.store(true, Ordering::Relaxed);
          let mut interval_timer = interval(Duration::from_secs(1));

          loop {
            tokio::select! {
              biased;

              _ = interval_timer.tick() => {
                println!("Interval tick!");
                // Trigger long press event
              }

              _ = token_clone.cancelled() => {
                println!("Inner select cancelled");
                break;
              }
            }
          }
        }
      }
    }));
  }
}
