import { useEffect, useCallback, useRef } from 'react'

type UseBarcodeScannerProps = {
  onScan: (barcode: string) => void
  enabled?: boolean
}

/**
 * A hook to globally listen for barcode scanner inputs.
 * Barcode scanners act as keyboards that type very fast and press Enter.
 * This hook listens for rapid keystrokes ending in Enter, preventing focus-stealing
 * while capturing the raw barcode string anywhere on the page.
 */
export function useBarcodeScanner({ onScan, enabled = true }: UseBarcodeScannerProps) {
  const barcodeRef = useRef<string>('')
  const lastKeyTimeRef = useRef<number>(0)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    // Ignore if user is consciously typing in an input field (unless it's specifically a small one that might misfire)
    // Wait, typically we WANT to intercept it if it's a fast scan, but if they type manually, we ignore.
    const isInputFocused = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)

    const currentTime = new Date().getTime()
    const timeLapse = currentTime - lastKeyTimeRef.current

    // If it's been more than 50ms since the last key, it's likely a human typing. Reset buffer.
    if (timeLapse > 50) {
      // Only reset if it's NOT the very first key
      if (barcodeRef.current.length > 0) {
        barcodeRef.current = ''
      }
    }

    if (e.key === 'Enter') {
      if (barcodeRef.current.length >= 3) {
        // We have a valid fast barcode scan!
        if (isInputFocused) {
          e.preventDefault() // Stop form submissions if focused on a random input
        }
        onScan(barcodeRef.current)
      }
      barcodeRef.current = '' // reset
      return
    }

    // Capture standard visible characters (letters, numbers, basic symbols)
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (timeLapse > 50 && barcodeRef.current.length === 0) {
        // Start of a potential scan
        barcodeRef.current = e.key
      } else if (timeLapse <= 50) {
        // Continuing a fast scan
        barcodeRef.current += e.key
        
        // Prevent default input typing if we are fairly certain this is a barcode scan (>3 chars fast)
        // This stops the scanner from depositing garbage text into whatever input is focused
        if (barcodeRef.current.length > 3 && isInputFocused) {
          e.preventDefault()
        }
      }
      lastKeyTimeRef.current = currentTime
    }
  }, [enabled, onScan])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
