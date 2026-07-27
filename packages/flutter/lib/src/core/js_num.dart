/// JS-compatible number stringification for SVG attribute interpolation.
library;

/// Match ECMAScript `Number#toString` for Navii SVG coords.
///
/// Integers omit a trailing `.0`. Non-integers use [double.toString], which for
/// IEEE values computed like the TS engine matches Node's output (including
/// binary float artifacts such as `2.2399999999999998`).
String jn(num v) {
  final d = v.toDouble();
  if (d.isNaN) return 'NaN';
  if (d.isInfinite) return d.isNegative ? '-Infinity' : 'Infinity';
  if (d == 0) return '0';

  final truncated = d.truncateToDouble();
  if (d == truncated && d.abs() <= 9007199254740991) {
    return truncated.toInt().toString();
  }
  return d.toString();
}
