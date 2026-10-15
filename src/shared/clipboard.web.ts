// Web preview only: the native clipboard module does not exist in the browser.
type ClipboardHost = {
  navigator?: { clipboard?: { writeText(text: string): Promise<void> } };
};

export async function copyToClipboard(text: string): Promise<void> {
  await (
    globalThis as unknown as ClipboardHost
  ).navigator?.clipboard?.writeText(text);
}
