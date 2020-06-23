const dependencies = new Set();
const watchers = [];

const reactive = obj => {
  const reactiveObj = {};
  for(let [k, v] of Object.entries(obj)) {
    const s = Symbol(k);
    Object.defineProperty(reactiveObj, k, {
      get() {
        dependencies.add(s);
        return v;
      },
      set(newValue) {
        v = newValue;
        getWatchersByKey(s).forEach(({callback}) => callback());
      }
    })
  }
  return reactiveObj;
}

const ref = (initialValue = void 0) => reactive({value: initialValue});
const computed = (caculate) => {
  const reference = ref(caculate());
  watch(() => {
    reference.value = caculate();
  });
  return reference;
}

const getWatchersByKey = (k) => {
  return watchers.filter( ({deps}) => deps.has(k) );
}

const getDependenciesByRunCallback = (callback) => {
  dependencies.clear();
  callback();
  const deps = new Set(dependencies);
  dependencies.clear();
  return deps;
}

const watch = (callback, options) => {
  const deps = getDependenciesByRunCallback(callback);
  watchers.push({
    callback,
    deps
  })
}

// const a = reactive([1, 2, 3])
// watch(() => {
//   console.log(a);
// })
// a.push(4);
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