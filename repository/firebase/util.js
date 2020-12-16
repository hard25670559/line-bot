function objectToArray(object) {
  const keys = Object.keys(object || []);
  const data = keys.map((key) => ({
    fid: key,
    ...object[key],
  }));
  return data;
}

module.exports = {
  objectToArray,
};
