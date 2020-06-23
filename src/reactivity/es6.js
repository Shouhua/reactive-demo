import { debounce } from 'lodash-es';

const dependencies = new Set();
function runAndGetDependencies(callback) {
  dependencies.clear();
  callback();
  const deps = new Set(dependencies);
  dependencies.clear();
  return deps;
}

function getWatchersDependingOn(symbol) {
  return watchers.filter(({ dependencies }) => dependencies.has(symbol));
}

export const reactive = obj => {
  const keyToSymbolMap = new Map();
  // key -> Symbol(key)
  const getSymbolFromKey = key => {
    if (keyToSymbolMap.has(key)) {
      return keyToSymbolMap.get(key);
    }
    const symbol = Symbol(key);
    keyToSymbolMap.set(key, symbol);
    return symbol;
  };
  const reactiveObject = new Proxy(
    { ...obj },
    {
      get(target, key) {
        dependencies.add(getSymbolFromKey(key));
        return target[key];
      },
      set(target, key, newValue) {
        if (typeof newValue === 'object' && typeof target[key] === 'object') {
          Object.assign(target[key], newValue);
        } else {
          target[key] = newValue;
        }
        getWatchersDependingOn(getSymbolFromKey(key)).forEach(({ callback }) =>
          callback()
        );
        return true;
      }
    }
  );

  // for (const [key, value] of Object.entries(obj)) {
  //   let internalValue = typeof value === 'object' ? reactive(value) : value;
  //   const symbol = Symbol(key);
  //   Object.defineProperty(reactiveObject, key, {
  //     get() {
  //       dependencies.add(symbol);
  //       return internalValue;
  //     },
  //     set(newValue) {
  //       if (typeof newValue === 'object' && typeof internalValue === 'object') {
  //         Object.assign(internalValue, newValue);
  //       } else {
  //         internalValue = newValue;
  //       }
  //       getWatchersDependingOn(symbol).forEach(({ callback }) => callback());
  //     }
  //   });
  // }

  return reactiveObject;
};

const watchers = [];
export const watch = callback => {
  const dependencies = runAndGetDependencies(callback);
  // key -> callback
  watchers.push({
    callback: debounce(callback),
    dependencies
  });
};

export const ref = (initialValue = void 0) => reactive({ value: initialValue });

export const computed = calculate => {
  const reference = ref(calculate());
  watch(() => {
    reference.value = calculate();
  });
  return reference;
};
