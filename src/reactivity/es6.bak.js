import {debounce} from 'lodash-es';

const reactive = obj => {
  const keyToSymbolMap = new Map();
  const getSymbolByKey = (key) => {
    if(keyToSymbolMap.has(key)) {
      return keyToSymbolMap.get(key);
    }
    const s = Symbol(key);
    keyToSymbolMap.set(key, s);
    return s
  };
  const p = new Proxy({...obj}, {
    get(target, key, receiver) {
      deps.add(getSymbolByKey(key));
      return Reflect.get(target, key, receiver);
    },
    set(target, key , newValue, receiver) {
      getCallbackByDep(getSymbolByKey(key)).forEach(({callback})=>callback());
      return Reflect.set(target, key, newValue, receiver);
    }
  });
  return p;
}

const getCallbackByDep = (s) => {
  return watchers.filter( ({ deps }) => deps.has(s) );
}

const getDepsByRunCallback = (callback) => {
  deps.clear();
  callback();
  const d = new Set(deps);
  deps.clear();
  return d;
}

const deps = new Set();
const watchers = [];

const ref = (initialValue = void 0) => reactive({value: initialValue});
const watch = (callback) => {
  const deps = getDepsByRunCallback(callback);
  watchers.push({
    callback: debounce(callback),
    deps
  });
};
const computed = (calculate) => {
  const reference = calculate();
  watch(() => {
    reference.value = calculate();
  });
  return reference;
}

// 
// const a = reactive({
//   label: 'hello world',
//   count: 3
// });

// watch(() => {
//   console.log('label: ', a.label);
//   console.log('count: ', a.count);
// });

// setInterval(() => {
//   a.count = Math.random();
// }, 1000)

const a = reactive({
  hello: 'world',
  count: 3,
  foo: {
    bar: 0
  }
});
watch(() => {
  console.log(a.foo.bar);
})

// let b = computed(() => {
//   console.log('run computed callback');
//   return a.count;
// });
setInterval(() => {
  a.foo.bar = Math.random();
  // console.log('b: ', b.value);
}, 1000)