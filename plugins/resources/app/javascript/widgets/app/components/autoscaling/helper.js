const STANDARD_HDD_ASSET_TYPE = 'project-quota:volumev2:capacity_standard_hdd';
const STANDARD_HDD_MINIMUM_SIZE = 1024;

const areObjectsEqual = (lhs, rhs) => {
  const lkeys = Object.keys(lhs);
  const rkeys = Object.keys(rhs);
  if (lkeys.length !== rkeys.length) {
    return false;
  }
  for (const key of lkeys) {
    if (!rkeys.includes(key)) {
      return false;
    }
    if (lhs[key] !== rhs[key]) {
      return false;
    }
  }
  return true;
};

//Takes a Castellum resource configuration and checks if it conforms to the
//format generated by this UI. Possible return values:
//
//  { custom: false, value: null,  minFree: null  } -> autoscaling not enabled
//  { custom: false, value: <int>, minFree: <int> } -> autoscaling enabled through this UI
//  { custom: true }                                -> autoscaling enabled through other Castellum client
export const parseConfig = (config, assetType) => {
  if (!config) {
    return { custom: false, value: null, minFree: null };
  }
  if (!config.size_steps.single) {
    return { custom: true };
  }

  //check thresholds
  if (!config.low_threshold || !config.critical_threshold || config.high_threshold) {
    return { custom: true };
  }
  const { usage_percent: lowPerc, delay_seconds: lowSecs } = config.low_threshold;
  const { usage_percent: criticalPerc } = config.critical_threshold;
  if (lowSecs != 60) {
    return { custom: true };
  }
  const expectedLowPerc = criticalPerc - 0.1
  //`if (lowPerc != expectedLowPerc)` does not always work as expected because
  //of rounding errors in previous operations; e.g. 99.9 - 50 = 49.900000000006
  //instead of 49.9
  if (Math.abs(lowPerc - expectedLowPerc) > 0.000001) {
    return { custom: true };
  }

  //check constraints
  const constraints = config.size_constraints || {};
  const minFree = constraints.minimum_free ? constraints.minimum_free : null;
  const expectedConstraints = {};
  if (minFree !== null) {
    expectedConstraints.minimum_free = minFree;
  }
  if (assetType == STANDARD_HDD_ASSET_TYPE) {
    expectedConstraints.minimum = STANDARD_HDD_MINIMUM_SIZE;
  }
  if (!areObjectsEqual(constraints, expectedConstraints)) {
    return { custom: true };
  }

  return {
    custom: false,
    value: 100 - criticalPerc,
    minFree,
  };
}

//Generate a Castellum resource configuration that parseConfig() recognizes.
export const generateConfig = (value, minFree, assetType) => {
  const config = {
    low_threshold: { usage_percent: 99.9 - value, delay_seconds: 60 },
    critical_threshold: { usage_percent: 100 - value },
    size_steps: { single: true },
    size_constraints: {},
  };
  if (minFree) {
    config.size_constraints.minimum_free = minFree;
  }
  if (assetType == STANDARD_HDD_ASSET_TYPE) {
    config.size_constraints.minimum = STANDARD_HDD_MINIMUM_SIZE;
  }

  return config;
}

export const isUnset = (value) =>
  value === null ||
  Number.isNaN(value) ||
  value === "" ||
  typeof value === "undefined"