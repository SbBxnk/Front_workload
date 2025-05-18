
export function getCleanFilename(filename: string): string {
    // Remove timestamp pattern (numbers-numbers-) from the beginning of the filename
    return filename.replace(/^\d+-\d+-/, "")
  }

  export function openFileWithCleanName(filePath: string, originalFilename: string): void {
    const cleanName = getCleanFilename(originalFilename)
    window.open(filePath, "_blank", `title=${cleanName}`)
  }
  