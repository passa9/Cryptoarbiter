import RandomBytes from 'randombytes';

var getRandom = arr => {
  var ln = arr.length;
  var buf = RandomBytes(ln);
  for (var i = 0; i < ln; i++) {
    arr[i] = buf[i];
  }return arr;
};

export default getRandom;
//# sourceMappingURL=secure-random.js.map