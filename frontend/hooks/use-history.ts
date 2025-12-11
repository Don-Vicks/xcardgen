import { useCallback, useReducer } from 'react'

enum ActionType {
  UNDO = 'UNDO',
  REDO = 'REDO',
  SET = 'SET',
  REPLACE = 'REPLACE',
  CLEAR = 'CLEAR',
}

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

type Action<T> =
  | { type: ActionType.UNDO }
  | { type: ActionType.REDO }
  | { type: ActionType.SET; newPresent: T }
  | { type: ActionType.REPLACE; newPresent: T }
  | { type: ActionType.CLEAR; initialPresent: T }

const historyReducer = <T>(
  state: HistoryState<T>,
  action: Action<T>
): HistoryState<T> => {
  const { past, present, future } = state

  switch (action.type) {
    case ActionType.UNDO: {
      if (past.length === 0) return state
      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      }
    }
    case ActionType.REDO: {
      if (future.length === 0) return state
      const next = future[0]
      const newFuture = future.slice(1)
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      }
    }
    case ActionType.SET: {
      if (action.newPresent === present) return state
      return {
        past: [...past, present],
        present: action.newPresent,
        future: [],
      }
    }
    case ActionType.REPLACE: {
      return {
        ...state,
        present: action.newPresent,
      }
    }
    case ActionType.CLEAR: {
      return {
        past: [],
        present: action.initialPresent,
        future: [],
      }
    }
    default:
      return state
  }
}

export function useHistory<T>(initialPresent: T) {
  const [state, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initialPresent,
    future: [],
  })

  const canUndo = state.past.length > 0
  const canRedo = state.future.length > 0

  const undo = useCallback(() => dispatch({ type: ActionType.UNDO }), [])
  const redo = useCallback(() => dispatch({ type: ActionType.REDO }), [])

  const set = useCallback(
    (newPresent: T | ((curr: T) => T)) => {
      const value =
        newPresent instanceof Function ? newPresent(state.present) : newPresent
      dispatch({ type: ActionType.SET, newPresent: value })
    },
    [state.present]
  )

  // Helper to reset history (e.g. on new template load)
  const clearHistory = useCallback((initial: T) => {
    dispatch({ type: ActionType.CLEAR, initialPresent: initial })
  }, [])

  // Helper to replace present without pushing to history (for live updates like dragging)
  const replace = useCallback(
    (newPresent: T | ((curr: T) => T)) => {
      const value =
        newPresent instanceof Function ? newPresent(state.present) : newPresent
      dispatch({ type: ActionType.REPLACE, newPresent: value })
    },
    [state.present]
  )

  return {
    state: state.present,
    set,
    replace, // Export this
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    past: state.past,
    future: state.future,
  }
}
