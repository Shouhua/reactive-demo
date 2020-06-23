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
  const reactiveObject = {};

  for (const [key, value] of Object.entries(obj)) {
    let internalValue = typeof value === 'object' ? reactive(value) : value;
    const symbol = Symbol(key);
    Object.defineProperty(reactiveObject, key, {
      get() {
        dependencies.add(symbol);
        return internalValue;
      },
      set(newValue) {
        if (typeof newValue === 'object' && typeof internalValue === 'object') {
          Object.assign(internalValue, newValue);
        } else {
          internalValue = newValue;
        }
        getWatchersDependingOn(symbol).forEach(({ callback }) => callback());
      }
    });
  }

  return reactiveObject;
};

const watchers = [];
export const watch = callback => {
  const dependencies = runAndGetDependencies(callback);
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
