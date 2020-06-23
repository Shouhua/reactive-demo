import { reactive, watch, ref, computed } from './reactivity/es6';

const brick1 = reactive({ weight: 0 });
const brick2 = ref({ weight: 0 });

const totalWeight = computed(() => {
  return brick1.weight + brick2.value.weight;
});

let i = 0;
watch(() => {
  console.log(`== ${i++} ==`);
  console.log(`Brick 1 weight: ${brick1.weight}`);
  console.log(`Brick 2 weight: ${brick2.value.weight}`);
});

watch(() => {
  console.log(`Total weight: ${totalWeight.value}.`);
});

watch(() => {
  console.log(`Brick 1's name: ${brick1.name}.`);
});

// brick1.weight = 9999;
// brick2.value = { weight: 9999 };
brick1.name = 'awesome brick';

setInterval(() => {
  brick1.weight = Math.random();
  brick2.value.weight = Math.random();
}, 1000);
