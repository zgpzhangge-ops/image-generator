import { useState, useEffect, useCallback } from 'react';

/**
 * @Hook useLocalStorage
 * @description 封装 localStorage 的读写操作，提供类型安全的存储和读取
 * @template T 存储数据的类型
 * @param key localStorage 键名
 * @param initialValue 初始值
 * @returns [存储的值, 设置值的函数]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  /**
   * 获取初始值的函数
   * 避免 SSR 环境下访问 localStorage
   */
  const getInitialValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getInitialValue);

  /**
   * 设置值的函数
   * @param value 新值，可以是直接值或函数
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  /**
   * 监听 storage 事件，实现跨标签页同步
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(
            `Error parsing localStorage change for key "${key}":`,
            error
          );
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * @Hook useLocalStorageBoolean
 * @description 专门用于布尔值的 localStorage Hook
 * @param key localStorage 键名
 * @param initialValue 初始值
 * @returns [存储的布尔值, 设置值的函数]
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean
): [boolean, (value: boolean) => void] {
  const [storedValue, setStoredValue] = useState<boolean>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: boolean) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * @Hook useLocalStorageString
 * @description 专门用于字符串值的 localStorage Hook
 * @param key localStorage 键名
 * @param initialValue 初始值
 * @returns [存储的字符串值, 设置值的函数]
 */
export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, (value: string) => void] {
  const [storedValue, setStoredValue] = useState<string>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: string) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * 清除指定 localStorage 项的 Hook
 * @param key localStorage 键名
 */
export function useClearLocalStorage(key: string): () => void {
  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key]);

  return clear;
}
