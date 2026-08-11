declare module 'react-native/Libraries/Components/TextInput/TextInputState' {
  import type { ReactNativeElement } from 'react-native';

  /**
   * React Native's registry of focusable text inputs. `TextInput.State` exposes
   * only a read-only subset publicly, so joining the registry needs this module.
   */
  const TextInputState: {
    currentlyFocusedInput(): ReactNativeElement | null;
    /** Marks an instance as focused. Does not dispatch a native focus command. */
    focusInput(instance: ReactNativeElement | null): void;
    /** Clears the focused instance, but only if it is the one passed in. */
    blurInput(instance: ReactNativeElement | null): void;
    registerInput(instance: ReactNativeElement): void;
    unregisterInput(instance: ReactNativeElement): void;
    isTextInput(instance: ReactNativeElement): boolean;
  };

  export default TextInputState;
}
