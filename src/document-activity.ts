import { createContext, useContext } from 'react'

/** Shared separately to keep primitive dialogs independent of workspace layouts.
 * Nested retained documents inherit inactivity from their parent. Consumers use
 * this signal to suspend polling, shortcuts and external portals. */
export const DocumentActivity = createContext(true)
export function useUiDocumentActive() {
  return useContext(DocumentActivity)
}
