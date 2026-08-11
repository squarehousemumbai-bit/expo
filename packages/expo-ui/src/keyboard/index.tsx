import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { ReactNativeElement } from 'react-native';

import { TextInputState } from './textInputState';

export type TextInputHostRegistry = {
  /** Registers a hosted text field. Returns the cleanup function. */
  addTextInput: () => () => void;
  /** Reports that a hosted text field gained or lost native focus. */
  setFocused: (focused: boolean) => void;
};

/** The wrapper component that `requireNativeView` returns. */
type NativeViewWrapper = {
  getNativeRef?: () => ReactNativeElement | null;
};

const TextInputHostContext = createContext<TextInputHostRegistry | null>(null);

/**
 * Used by `<Host>`. Attach `hostRef` to the native host view and pass the
 * registry to {@link TextInputHostProvider}.
 */
export function useTextInputHost() {
  const hostRef = useRef<NativeViewWrapper | null>(null);

  const registry = useMemo(() => {
    let mountedTextInputs = 0;
    let registered: ReactNativeElement | null = null;

    const enroll = () => {
      if (!registered) {
        const instance = hostRef.current?.getNativeRef?.() ?? null;
        if (instance) {
          TextInputState.registerInput(instance);
          registered = instance;
        }
      }
      return registered;
    };

    const withdraw = () => {
      if (!registered) {
        return;
      }
      TextInputState.blurInput(registered);
      TextInputState.unregisterInput(registered);
      registered = null;
    };

    return {
      addTextInput() {
        mountedTextInputs += 1;
        enroll();
        return () => {
          mountedTextInputs -= 1;
          // The host's registration is shared, so only the last field releases it.
          if (mountedTextInputs === 0) {
            withdraw();
          }
        };
      },
      setFocused(focused: boolean) {
        const instance = enroll();
        if (!instance) {
          return;
        }
        if (focused) {
          TextInputState.focusInput(instance);
        } else {
          TextInputState.blurInput(instance);
        }
      },
      dispose: withdraw,
    };
  }, []);

  useEffect(() => registry.dispose, [registry]);

  return { hostRef, registry };
}

// Used by `<Host>` to provide the registry to hosted Compose/SwiftUI text fields.
export function TextInputHostProvider({
  registry,
  children,
}: {
  registry: TextInputHostRegistry;
  children: React.ReactNode;
}) {
  return <TextInputHostContext.Provider value={registry}>{children}</TextInputHostContext.Provider>;
}

// Used by SwiftUI/Compose TextField to register the TextField with RN's TextInputState
export function useHostedTextInputFocus(onFocusChange?: (focused: boolean) => void) {
  const registry = useContext(TextInputHostContext);

  useEffect(() => registry?.addTextInput(), [registry]);

  return useCallback(
    (focused: boolean) => {
      registry?.setFocused(focused);
      onFocusChange?.(focused);
    },
    [registry, onFocusChange]
  );
}
