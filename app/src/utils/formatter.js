import BigNumber from "bignumber.js"

const decimalRules = {
    long: 6,
    medium: 4,
    short: 2
};

export const formatNumber = ({value,
                              precision = decimalRules.short,
                              percentage = false,
                              integer = false,
                              infinity = 'N/A',
                              rounding = BigNumber.ROUND_DOWN
                              }) => {
    if (!BigNumber.isBigNumber(value)) value = BigNumber(value);
    if (['Infinity', Infinity].includes(value.toFixed(precision))) return infinity;
    if (percentage) value = value.times(100);
    if (integer) value = value.integerValue(BigNumber.ROUND_HALF_UP);
    if (value.lt(1) && rounding === BigNumber.ROUND_DOWN) precision = decimalRules.medium;
    
    return value.toFixed(precision, rounding);
};

export function formatter(target, options = {}) {
    return formatNumber({ value: target, ...options });
}
