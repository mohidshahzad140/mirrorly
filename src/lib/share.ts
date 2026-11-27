/** Opens the phone's share sheet with the image; downloads it where sharing files isn't supported. */
export async function shareOrDownload(image: Blob, filename: string): Promise<"shared" | "downloaded"> {
  const file = new File([image], filename, { type: image.type || "image/png" });
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My Mirrorly try-on" });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "shared"; // user closed the sheet
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
