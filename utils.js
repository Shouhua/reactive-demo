/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */
function find (list, f) {
  return list.filter(f)[0]
}
function deepCopy (obj, cache = []) {
  // just return if obj is immutable value
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // if obj is hit, it is in circular structure
  const hit = find(cache, c => c.original === obj)
  if (hit) {
    return hit.copy
  }

  const copy = Array.isArray(obj) ? [] : {}
  // put the copy into cache at first
  // because we want to refer it in recursive deepCopy
  cache.push({
    original: obj,
    copy
  })

  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache)
  })

  return copy
}

let o = {
  a: 1
}

const copy = deepCopy(o);
if(o === copy) {
  console.log('equal')
} else {
  console.log(copy)
  console.log('not equal')
}

let obj = {};
const key1 = Symbol('key1')

// 数据描述符
Object.defineProperty(obj, key1, {
  enumerable: true,
  configurable: false, // 控制能不能修改描述符（除去writable和value之外的描述符）以及能不能删除该属性
  writable: false,
  value: 3
});

Object.defineProperty(obj, 'count', {
  enumerable: true,
  value: 100
})

const key2 = 'key2';
let value2;
// 存取描述符
Object.defineProperty(obj, key2, {
  get() {
    return value2;
  },
  set(v) {
    value2 = v;
  }
})

obj.label = 'hello'

Object.keys(obj).forEach(item => console.log(item));

var Person = function(firstName, lastName) {
  if(this instanceof Person) {
    console.log('Use new keyword to initialize');
  } else {
    console.log('NOT USE NEW');
  }
  this.firstName = firstName;
  this.lastName = lastName;
}

var p1 = new Person('Lebron', 'James');
var p2 = Person('hello', 'world');